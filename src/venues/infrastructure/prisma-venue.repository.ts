import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { IVenueRepository } from '../core/ports/venue.repository.interface.js';
import { Prisma } from '../../../generated/prisma/client.js';
import { GetVenuesFilterDto } from '../delivery/http/dto/get-venues-filter.dto.js';
import { CreateVenueDto } from '../delivery/http/dto/create-venue.dto.js';
import {
  EventCentreDiscoveryEntity,
  EventCentreDetailedEntity,
} from '../core/domain/venue.types.js';
import { MediaStorageService } from '../../storage/media-storage.service.js';

@Injectable()
export class PrismaVenueRepository implements IVenueRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mediaSrorage: MediaStorageService,
  ) {}

  async findMany(
    filters: GetVenuesFilterDto,
  ): Promise<{ data: EventCentreDiscoveryEntity[]; total: number }> {
    const { location, minCapacity, maxPrice, amenities, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const whereClause: Prisma.EventCentreWhereInput = {
      ...(location && { location: { contains: location, mode: 'insensitive' } }),
      ...(minCapacity && { capacity: { gte: minCapacity } }),
      ...(maxPrice != null && {
        OR: [{ priceRangeMax: { lte: maxPrice } }, { priceRangeMin: { lte: maxPrice } }],
      }),
      ...(amenities &&
        amenities.length > 0 && {
          amenities: {
            some: { name: { in: amenities } },
          },
        }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.eventCentre.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          media: {
            orderBy: { order: 'asc' },
            take: 1,
          },
          amenities: true,
        },
      }),
      this.prisma.eventCentre.count({ where: whereClause }),
    ]);

    // Prisma's generated payload structurally satisfies EventCentreDiscoveryEntity
    return { data: data, total };
  }

  async create(accountId: string, payload: CreateVenueDto): Promise<EventCentreDetailedEntity> {
    // Resolve the internal User ID from the Auth Account ID
    const user = await this.prisma.user.findUnique({
      where: { accountId },
      select: { id: true },
    });

    if (!user) throw new UnauthorizedException('User profile not found for this account');

    const slug = `${payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;

    return await this.prisma.eventCentre.create({
      data: {
        slug,
        ownerId: user.id,
        name: payload.name,
        description: payload.description,
        location: payload.location,
        address: payload.address,
        capacity: payload.capacity,
        priceRangeMin: payload.priceRangeMin,
        priceRangeMax: payload.priceRangeMax,
        contactPhone: payload.contactPhone,
        contactWhatsapp: payload.contactWhatsapp,
        media: payload.media
          ? {
              create: payload.media.map((m) => ({ ...m })),
            }
          : undefined,
        perks: payload.perks
          ? {
              create: payload.perks.map((p) => ({ ...p })),
            }
          : undefined,
        amenities: payload.amenities
          ? {
              connectOrCreate: payload.amenities.map((name) => ({
                where: { name },
                create: { name },
              })),
            }
          : undefined,
      },
      include: { media: true, perks: true, amenities: true },
    });
  }

  async findById(id: string): Promise<EventCentreDetailedEntity | null> {
    return await this.prisma.eventCentre.findUnique({
      where: { id },
      include: { media: true, perks: true, amenities: true },
    });
  }

  async update(
    id: string,
    accountId: string,
    payload: Partial<CreateVenueDto>,
  ): Promise<EventCentreDetailedEntity> {
    const existingVenue = await this.prisma.eventCentre.findUnique({
      where: { id },
      include: {
        media: true,
        perks: true,
        amenities: true,
        owner: { select: { accountId: true } }, // Pull owner accountId to verify
      },
    });

    if (!existingVenue) throw new NotFoundException('Venue not found');

    if (existingVenue.owner.accountId !== accountId) {
      throw new ForbiddenException('You do not have permission to update this venue');
    }

    const updateData: Prisma.EventCentreUpdateInput = {
      ...Object.fromEntries(
        Object.entries(payload).filter(([key]) => !['media', 'perks', 'amenities'].includes(key)),
      ),
    };

    // handle media clean up if media is being updated
    if (payload.media) {
      const currentPublicIds = existingVenue.media.map((m) => m.publicId);
      const newPublicIds = payload.media.map((m) => m.publicId);

      const toDelete = currentPublicIds.filter((id) => !newPublicIds.includes(id));
      if (toDelete.length > 0) {
        await Promise.all(toDelete.map((publicId) => this.mediaSrorage.deleteMedia(publicId)));
      }

      updateData.media = {
        deleteMany: {}, // Delete all DB records for this venue's media
        create: payload.media.map((m) => ({ ...m })), // Re-insert incoming set
      };
    }

    if (payload.perks) {
      updateData.perks = {
        deleteMany: { eventCentreId: id },
        create: payload.perks.map((p) => ({ ...p })),
      };
    }

    if (payload.amenities) {
      updateData.amenities = {
        set: [], // Clear existing amenities
        connectOrCreate: payload.amenities.map((name) => ({
          where: { name },
          create: { name },
        })),
      };
    }

    return await this.prisma.eventCentre.update({
      where: { id },
      data: updateData,
      include: { media: true, perks: true, amenities: true },
    });
  }
}
