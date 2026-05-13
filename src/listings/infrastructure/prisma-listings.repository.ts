import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { IListingRepository } from '../core/ports/listing.repository.interface.js';
import { CreateListingDto } from '../delivery/http/dto/create-listing.dto.js';
import { GetListingsFilterDto } from '../delivery/http/dto/get-listings-filter.dto.js';
import { ListingView } from '../core/domain/listing.view.js';
import { Prisma } from '../../../generated/prisma/client.js';
import { ListingMapper } from './mappers/listing.mapper.js';
import { UpdateListingDto } from '../delivery/http/dto/update-listing.dto.js';
import { MediaStorageService } from '../../storage/media-storage.service.js';

@Injectable()
export class PrismaListingsRepository implements IListingRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mediaStorage: MediaStorageService,
  ) {}

  async findMany(filters: GetListingsFilterDto): Promise<{ data: ListingView[]; total: number }> {
    const { category, minPrice, maxPrice, search, attributes, page, limit } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.ListingWhereInput = {
      ...(category && { category: { slug: category } }),
      ...(minPrice !== undefined || maxPrice !== undefined
        ? {
            basePrice: {
              ...(minPrice !== undefined && { gte: minPrice }),
              ...(maxPrice !== undefined && { lte: maxPrice }),
            },
          }
        : {}),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    // We use the 'path' and 'equals' approach for Postgres JSONB efficiency.
    if (attributes && Object.keys(attributes).length > 0) {
      where.AND = Object.entries(attributes).map(([key, value]) => ({
        attributes: {
          path: [key],
          equals: value,
        },
      }));
    }

    const [rawListings, total] = await this.prisma.$transaction([
      this.prisma.listing.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: true,
          media: true,
          owner: { select: { name: true, avatarUrl: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.listing.count({ where }),
    ]);

    return {
      data: rawListings.map((listing) => ListingMapper.toView(listing)),
      total,
    };
  }

  async create(accountId: string, payload: CreateListingDto): Promise<ListingView> {
    const slug = `${payload.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;

    const user = await this.prisma.user.findUniqueOrThrow({ where: { accountId } });

    const rawListing = await this.prisma.listing.create({
      data: {
        slug,
        title: payload.title,
        description: payload.description,
        basePrice: payload.basePrice,
        currency: payload.currency,
        attributes: payload.attributes as Prisma.JsonObject,
        categoryId: payload.categoryId,
        ownerId: user.id,

        media: payload.media
          ? {
              create: payload.media.map((m) => ({
                url: m.url,
                publicId: m.publicId,
                order: m.order,
              })),
            }
          : undefined,
      },
      include: {
        category: true,
        media: true,
        owner: { select: { name: true, avatarUrl: true } },
      },
    });

    return ListingMapper.toView(rawListing);
  }

  async update(id: string, accountId: string, payload: UpdateListingDto): Promise<ListingView> {
    // 1. Fetch the existing state to compare media and check ownership
    const existing = await this.prisma.listing.findUnique({
      where: { id },
      include: { media: true, owner: { select: { accountId: true } } },
    });

    if (!existing) throw new NotFoundException('Listing not found');

    // 2. Authorization Check
    if (existing.owner.accountId !== accountId) {
      throw new ForbiddenException('You do not have permission to update this listing');
    }

    const updateData: Prisma.ListingUpdateInput = {
      title: payload.title,
      description: payload.description,
      basePrice: payload.basePrice,
      ...(payload.categoryId ? { category: { connect: { id: payload.categoryId } } } : {}),
      attributes: payload.attributes,
    };

    // 3. Media Cleanup & Sync
    if (payload.media) {
      const currentPublicIds = existing.media.map((m) => m.publicId);
      const newPublicIds = payload.media.map((m) => m.publicId);

      // Identify what was removed
      const toDelete = currentPublicIds.filter((pubId) => !newPublicIds.includes(pubId));

      if (toDelete.length > 0) {
        // Clean up external storage (Cloudinary/S3)
        await Promise.all(toDelete.map((pubId) => this.mediaStorage.deleteMedia(pubId)));
      }

      // Sync database records
      updateData.media = {
        deleteMany: {}, // Clear current media relations
        create: payload.media.map((m) => ({
          url: m.url,
          publicId: m.publicId,
          order: m.order,
        })),
      };
    }

    // 4. Final Update
    const updated = await this.prisma.listing.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        media: true,
        owner: { select: { name: true, avatarUrl: true } },
      },
    });

    return ListingMapper.toView(updated);
  }

  async findBySlug(slug: string): Promise<ListingView | null> {
    const rawListing = await this.prisma.listing.findUnique({
      where: { slug },
      include: {
        category: true,
        media: true,
        owner: { select: { name: true, avatarUrl: true } },
      },
    });

    if (!rawListing) return null;

    return ListingMapper.toView(rawListing);
  }

  async findById(id: string): Promise<ListingView | null> {
    const rawListing = await this.prisma.listing.findUnique({
      where: { id },
      include: {
        category: true,
        media: true,
        owner: { select: { name: true, avatarUrl: true } },
      },
    });

    if (!rawListing) return null;

    return ListingMapper.toView(rawListing);
  }

  async delete(id: string, accountId: string): Promise<void> {
    // 1. Fetch to verify ownership and get media IDs
    const listing = await this.prisma.listing.findUnique({
      where: { id },
      include: {
        media: true,
        owner: { select: { accountId: true } },
      },
    });

    if (!listing) throw new NotFoundException('Listing not found');

    // 2. Ownership Guard
    if (listing.owner.accountId !== accountId) {
      throw new ForbiddenException('You do not have permission to delete this listing');
    }

    // 3. Cleanup Cloud Storage
    if (listing.media.length > 0) {
      const publicIds = listing.media.map((m) => m.publicId);
      await Promise.all(publicIds.map((pid) => this.mediaStorage.deleteMedia(pid)));
    }

    // 4. Delete from DB (Cascade will handle Media rows)
    await this.prisma.listing.delete({
      where: { id },
    });
  }
}
