import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { IVenueRepository } from '../core/ports/venue.repository.interface.js';
import { Prisma } from '../../../generated/prisma/client.js';
import { GetVenuesFilterDto } from '../delivery/http/dto/get-venues-filter.dto.js';
import { CreateVenueDto } from '../delivery/http/dto/create-venue.dto.js';

@Injectable()
export class PrismaVenueRepository implements IVenueRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(filters: GetVenuesFilterDto) {
    const { location, minCapacity, maxPrice, amenities, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    // Constructing the query object dynamically
    const whereClause: Prisma.EventCentreWhereInput = {
      ...(location && { location: { contains: location, mode: 'insensitive' } }),
      ...(minCapacity && { capacity: { gte: minCapacity } }),
      ...(maxPrice && {
        OR: [{ priceRangeMax: { lte: maxPrice } }, { priceRangeMin: { lte: maxPrice } }],
      }),
      ...(amenities &&
        amenities.length > 0 && {
          amenities: {
            some: {
              name: { in: amenities },
            },
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
            orderBy: { order: 'asc' }, // Ensure main image (0) is first
            take: 1, // Only pull the main image for discovery list
          },
          amenities: true,
        },
      }),
      this.prisma.eventCentre.count({ where: whereClause }),
    ]);

    return { data, total };
  }

  async create(ownerId: string, payload: CreateVenueDto) {
    // Generate a slug from the name. In production, ensure uniqueness.
    const slug =
      payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') +
      '-' +
      Date.now().toString().slice(-4);

    return this.prisma.eventCentre.create({
      data: {
        slug,
        ownerId,
        name: payload.name,
        description: payload.description,
        location: payload.location,
        address: payload.address,
        capacity: payload.capacity,
        priceRangeMin: payload.priceRangeMin,
        priceRangeMax: payload.priceRangeMax,
        contactPhone: payload.contactPhone,
        contactWhatsapp: payload.contactWhatsapp,

        // Nested Writes for Relations
        media: payload.media
          ? {
              create: payload.media.map((m) => ({
                url: m.url,
                type: m.type,
                order: m.order,
                caption: m.caption,
              })),
            }
          : undefined,

        perks: payload.perks
          ? {
              create: payload.perks.map((p) => ({
                title: p.title,
                description: p.description,
              })),
            }
          : undefined,

        // Implicit M:N - Connect existing or create new amenities
        amenities: payload.amenities
          ? {
              connectOrCreate: payload.amenities.map((amenityName) => ({
                where: { name: amenityName },
                create: { name: amenityName },
              })),
            }
          : undefined,
      },
      include: {
        media: true,
        perks: true,
        amenities: true,
      },
    });
  }
}
