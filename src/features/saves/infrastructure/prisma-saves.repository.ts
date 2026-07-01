import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service.js';
import {
  ISavesRepository,
  SavedBusinessView,
  SavedListingView,
} from '../domain/ports/saves.repository.port.js';

@Injectable()
export class PrismaSavesRepository implements ISavesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async saveListing(userId: string, listingId: string): Promise<void> {
    await this.prisma.savedListing.upsert({
      where: {
        userId_listingId: {
          userId,
          listingId,
        },
      },
      update: {},
      create: {
        userId,
        listingId,
      },
    });
  }

  async unsaveListing(userId: string, listingId: string): Promise<void> {
    await this.prisma.savedListing
      .delete({
        where: {
          userId_listingId: {
            userId,
            listingId,
          },
        },
      })
      .catch(() => {
        // Ignore if it doesn't exist
      });
  }

  async saveBusiness(userId: string, businessProfileId: string): Promise<void> {
    await this.prisma.savedBusiness.upsert({
      where: {
        userId_businessProfileId: {
          userId,
          businessProfileId,
        },
      },
      update: {},
      create: {
        userId,
        businessProfileId,
      },
    });
  }

  async unsaveBusiness(userId: string, businessProfileId: string): Promise<void> {
    await this.prisma.savedBusiness
      .delete({
        where: {
          userId_businessProfileId: {
            userId,
            businessProfileId,
          },
        },
      })
      .catch(() => {
        // Ignore if it doesn't exist
      });
  }

  async isListingSaved(userId: string, listingId: string): Promise<boolean> {
    const count = await this.prisma.savedListing.count({
      where: { userId, listingId },
    });
    return count > 0;
  }

  async isBusinessSaved(userId: string, businessProfileId: string): Promise<boolean> {
    const count = await this.prisma.savedBusiness.count({
      where: { userId, businessProfileId },
    });
    return count > 0;
  }

  async getSavedListings(
    userId: string,
    skip: number,
    take: number,
  ): Promise<{ items: SavedListingView[]; total: number }> {
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.savedListing.findMany({
        where: { userId },
        include: {
          listing: {
            include: {
              media: {
                orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
                take: 1,
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.savedListing.count({ where: { userId } }),
    ]);

    const items = rows.map((r) => ({
      id: r.id,
      userId: r.userId,
      listingId: r.listingId,
      createdAt: r.createdAt,
      listing: {
        id: r.listing.id,
        businessProfileId: r.listing.businessProfileId,
        title: r.listing.title,
        slug: r.listing.slug,
        description: r.listing.description,
        status: r.listing.status,
        minPrice: r.listing.minPrice ? r.listing.minPrice.toNumber() : null,
        maxPrice: r.listing.maxPrice ? r.listing.maxPrice.toNumber() : null,
        currencyCode: r.listing.currencyCode,
        isNegotiable: r.listing.isNegotiable,
        createdAt: r.listing.createdAt,
        updatedAt: r.listing.updatedAt,
        coverUrl: r.listing.media[0]?.url,
      },
    }));

    return { items, total };
  }

  async getSavedBusinesses(
    userId: string,
    skip: number,
    take: number,
  ): Promise<{ items: SavedBusinessView[]; total: number }> {
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.savedBusiness.findMany({
        where: { userId },
        include: {
          businessProfile: {
            include: {
              media: {
                orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
              },
              tags: {
                include: { tag: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.savedBusiness.count({ where: { userId } }),
    ]);

    const items = rows.map((r) => ({
      id: r.id,
      userId: r.userId,
      businessProfileId: r.businessProfileId,
      createdAt: r.createdAt,
      businessProfile: {
        id: r.businessProfile.id,
        ownerId: r.businessProfile.ownerId,
        name: r.businessProfile.name,
        slug: r.businessProfile.slug,
        verificationStatus: r.businessProfile.verificationStatus,
        isPublic: r.businessProfile.isPublic,
        description: r.businessProfile.description,
        businessType: r.businessProfile.businessType,
        createdAt: r.businessProfile.createdAt,
        updatedAt: r.businessProfile.updatedAt,
        logoUrl: r.businessProfile.media.find((m) => m.role === 'LOGO')?.url,
        bannerUrl: r.businessProfile.media.find((m) => m.role === 'BANNER')?.url,
        tags: r.businessProfile.tags.map((t) => t.tag.name),
      },
    }));

    return { items, total };
  }
}
