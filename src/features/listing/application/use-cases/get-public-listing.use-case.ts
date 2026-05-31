import { Injectable, NotFoundException } from '@nestjs/common';
import { IListingRepository } from '../../domain/ports/listing.repository.port.js';
import { ListingStatus } from '../../domain/types/listing-status.enum.js';
import { Listing } from '../../domain/types/listing.entity.js';

@Injectable()
export class GetPublicListingUseCase {
  constructor(private readonly repo: IListingRepository) {}

  async execute(slug: string): Promise<Listing> {
    const listing = await this.repo.findBySlug(slug);

    if (!listing || listing.status !== ListingStatus.PUBLISHED) {
      throw new NotFoundException('Listing not found.');
    }

    return listing;
  }
}
