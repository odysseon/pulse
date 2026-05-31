import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { IListingRepository } from '../../domain/ports/listing.repository.port.js';
import { IBusinessProfileRepository } from '../../../business-profile/domain/ports/business-profile.repository.port.js';

@Injectable()
export class DeleteListingUseCase {
  constructor(
    private readonly listingRepo: IListingRepository,
    private readonly businessRepo: IBusinessProfileRepository,
  ) {}

  async execute(id: string, requesterId: string): Promise<void> {
    const listing = await this.listingRepo.findById(id);

    if (!listing) {
      throw new NotFoundException('Listing not found.');
    }

    const profile = await this.businessRepo.findById(listing.businessProfileId);

    if (!profile) {
      throw new NotFoundException('Business profile not found.');
    }

    if (profile.ownerId !== requesterId) {
      throw new ForbiddenException('You do not own this business profile.');
    }

    await this.listingRepo.delete(id);
  }
}
