import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { IStoreTourRepository } from '../domain/ports/store-tour.repository.port.js';
import { StoreTour, StoreTourStatus } from '../domain/types/store-tour.entity.js';
import {
  CreateStoreTourInput,
  DiscoverStoreToursInput,
  PaginatedStoreTours,
  StoreTourView,
  UpdateStoreTourInput,
} from '../domain/types/store-tour.types.js';
import {
  StoreTour as PrismaStoreTour,
  StoreTourHighlight as PrismaStoreTourHighlight,
  StoreTourStatus as PrismaStoreTourStatus,
  Media as PrismaMedia,
  Prisma,
} from '../../../../generated/prisma/client.js';

type PrismaStoreTourWithRelations = PrismaStoreTour & {
  highlights: PrismaStoreTourHighlight[];
  media: PrismaMedia[];
};

function toDomain(raw: PrismaStoreTourWithRelations): StoreTour {
  const sortedMedia = (raw.media ?? []).toSorted((a, b) => (a.order ?? 0) - (b.order ?? 0));
  return {
    id: raw.id,
    businessProfileId: raw.businessProfileId,
    title: raw.title,
    summary: raw.summary,
    visitDate: raw.visitDate,
    status: raw.status as StoreTourStatus,
    publishedAt: raw.publishedAt,
    createdById: raw.createdById,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    highlights: raw.highlights.map((h) => ({ id: h.id, value: h.value })),
    media: sortedMedia.map((m) => ({
      id: m.id,
      url: m.url,
      mediaType: m.mediaType,
      order: m.order,
      createdAt: m.createdAt,
    })),
  };
}

function toView(raw: PrismaStoreTourWithRelations): StoreTourView {
  return toDomain(raw);
}

@Injectable()
export class PrismaStoreTourRepository extends IStoreTourRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async create(input: CreateStoreTourInput): Promise<StoreTour> {
    const raw = await this.prisma.storeTour.create({
      data: {
        businessProfileId: input.businessProfileId,
        title: input.title,
        summary: input.summary ?? null,
        visitDate: input.visitDate,
        createdById: input.createdById,
        status: PrismaStoreTourStatus.DRAFT,
        highlights: {
          create: input.highlights?.map((value) => ({ value })) ?? [],
        },
      },
      include: {
        highlights: true,
        media: true,
      },
    });
    return toDomain(raw);
  }

  async findById(id: string): Promise<StoreTourView | null> {
    const raw = await this.prisma.storeTour.findUnique({
      where: { id },
      include: {
        highlights: true,
        media: true,
      },
    });
    return raw ? toView(raw) : null;
  }

  async update(id: string, input: UpdateStoreTourInput): Promise<StoreTour> {
    const raw = await this.prisma.$transaction(async (tx) => {
      if (input.highlights !== undefined) {
        // Replace all highlights if provided
        await tx.storeTourHighlight.deleteMany({
          where: { storeTourId: id },
        });
      }

      const publishedAtUpdate =
        input.status === StoreTourStatus.PUBLISHED ? { publishedAt: new Date() } : {};

      return tx.storeTour.update({
        where: { id },
        data: {
          ...(input.title !== undefined && { title: input.title }),
          ...(input.summary !== undefined && { summary: input.summary }),
          ...(input.visitDate !== undefined && { visitDate: input.visitDate }),
          ...(input.status !== undefined && { status: input.status as PrismaStoreTourStatus }),
          ...publishedAtUpdate,
          ...(input.highlights !== undefined && {
            highlights: {
              create: input.highlights.map((value) => ({ value })),
            },
          }),
        },
        include: {
          highlights: true,
          media: true,
        },
      });
    });

    return toDomain(raw);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.storeTour.delete({
      where: { id },
    });
  }

  async discover(input: DiscoverStoreToursInput): Promise<PaginatedStoreTours> {
    const where: any = {
      ...(input.businessProfileId && { businessProfileId: input.businessProfileId }),
      ...(input.status && { status: input.status as PrismaStoreTourStatus }),
    };

    const skip = (input.page - 1) * input.limit;

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.storeTour.findMany({
        where,
        skip,
        take: input.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          highlights: true,
          media: true,
        },
      }),
      this.prisma.storeTour.count({ where }),
    ]);

    return {
      items: rows.map((r) => toView(r as PrismaStoreTourWithRelations)),
      total,
      page: input.page,
      limit: input.limit,
    };
  }

  async discoverGlobal(input: DiscoverStoreToursInput): Promise<any> {
    const limit = input.limit;
    const offset = (input.page - 1) * limit;

    // Use PostGIS if location is provided
    if (input.lat !== undefined && input.lng !== undefined && input.radiusInKm !== undefined) {
      const radiusMeters = input.radiusInKm * 1000;
      
      const searchPattern = input.search ? `%${input.search}%` : '%';
      const statusFilter = input.status ? Prisma.sql`AND st.status = ${input.status}::"StoreTourStatus"` : Prisma.empty;

      // Note: we fetch the cover media as a subquery or join.
      const rows = await this.prisma.$queryRaw<any[]>`
        SELECT 
          st.id,
          st."businessProfileId",
          st.title,
          st.summary,
          st."visitDate",
          st.status,
          st."publishedAt",
          bp.slug as "businessProfileSlug",
          ST_Distance(bp.location, ST_SetSRID(ST_MakePoint(${input.lng}, ${input.lat}), 4326)) as "distanceMeters",
          (
            SELECT m.url 
            FROM media m 
            WHERE m."storeTourId" = st.id 
            ORDER BY m."order" ASC NULLS LAST, m."createdAt" ASC 
            LIMIT 1
          ) as "coverUrl"
        FROM store_tours st
        JOIN business_profiles bp ON st."businessProfileId" = bp.id
        WHERE ST_DWithin(
          bp.location,
          ST_SetSRID(ST_MakePoint(${input.lng}, ${input.lat}), 4326),
          ${radiusMeters}
        )
        AND (st.title ILIKE ${searchPattern} OR st.summary ILIKE ${searchPattern})
        ${statusFilter}
        ORDER BY "distanceMeters" ASC
        LIMIT ${limit} OFFSET ${offset}
      `;

      const [{ count }] = await this.prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*)::bigint as count
        FROM store_tours st
        JOIN business_profiles bp ON st."businessProfileId" = bp.id
        WHERE ST_DWithin(
          bp.location,
          ST_SetSRID(ST_MakePoint(${input.lng}, ${input.lat}), 4326),
          ${radiusMeters}
        )
        AND (st.title ILIKE ${searchPattern} OR st.summary ILIKE ${searchPattern})
        ${statusFilter}
      `;

      return {
        items: rows.map(r => ({
          id: r.id,
          businessProfileId: r.businessProfileId,
          businessProfileSlug: r.businessProfileSlug,
          title: r.title,
          summary: r.summary,
          visitDate: r.visitDate,
          status: r.status,
          publishedAt: r.publishedAt,
          coverUrl: r.coverUrl,
          distanceKm: r.distanceMeters / 1000,
        })),
        total: Number(count),
        page: input.page,
        limit,
      };
    }

    // Fallback to standard Prisma query without location
    const where: any = {
      ...(input.status && { status: input.status as PrismaStoreTourStatus }),
      ...(input.search && {
        OR: [
          { title: { contains: input.search, mode: 'insensitive' } },
          { summary: { contains: input.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.storeTour.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          businessProfile: { select: { slug: true } },
          media: {
            orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
            take: 1,
          },
        },
      }),
      this.prisma.storeTour.count({ where }),
    ]);

    return {
      items: rows.map((r) => ({
        id: r.id,
        businessProfileId: r.businessProfileId,
        businessProfileSlug: r.businessProfile.slug,
        title: r.title,
        summary: r.summary,
        visitDate: r.visitDate,
        status: r.status as StoreTourStatus,
        publishedAt: r.publishedAt,
        coverUrl: r.media[0]?.url,
      })),
      total,
      page: input.page,
      limit,
    };
  }
}
