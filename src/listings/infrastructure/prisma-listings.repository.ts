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
import slugify from 'slugify';

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

    if (attributes && Object.keys(attributes).length > 0) {
      where.AND = Object.entries(attributes).map(([key, value]) => ({
        attributes: {
          path: [key],
          equals: value as Prisma.InputJsonValue,
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
    const baseSlug = slugify(payload.title, { lower: true, strict: true, trim: true });
    const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

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
    const existing = await this.prisma.listing.findUnique({
      where: { id },
      include: { media: true, owner: { select: { accountId: true } } },
    });

    if (!existing) throw new NotFoundException('Listing not found');

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

    if (payload.media) {
      const currentPublicIds = existing.media.map((m) => m.publicId);
      const newPublicIds = payload.media.map((m) => m.publicId);

      const toDelete = currentPublicIds.filter((pubId) => !newPublicIds.includes(pubId));

      if (toDelete.length > 0) {
        await Promise.all(toDelete.map((pubId) => this.mediaStorage.deleteMedia(pubId)));
      }

      updateData.media = {
        deleteMany: {},
        create: payload.media.map((m) => ({
          url: m.url,
          publicId: m.publicId,
          order: m.order,
        })),
      };
    }

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
    const listing = await this.prisma.listing.findUnique({
      where: { id },
      include: {
        media: true,
        owner: { select: { accountId: true } },
      },
    });

    if (!listing) throw new NotFoundException('Listing not found');

    if (listing.owner.accountId !== accountId) {
      throw new ForbiddenException('You do not have permission to delete this listing');
    }

    if (listing.media.length > 0) {
      const publicIds = listing.media.map((m) => m.publicId);
      await Promise.all(publicIds.map((pid) => this.mediaStorage.deleteMedia(pid)));
    }

    await this.prisma.listing.delete({
      where: { id },
    });
  }
}
