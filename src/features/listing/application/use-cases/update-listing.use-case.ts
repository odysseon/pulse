import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { IListingRepository } from '../../domain/ports/listing.repository.port.js';
import { UpdateListingInput } from '../../domain/types/listing.types.js';
import { Listing } from '../../domain/types/listing.entity.js';
import { IBusinessProfileRepository } from '../../../business-profile/domain/ports/business-profile.repository.port.js';

@Injectable()
export class UpdateListingUseCase {
  constructor(
    private readonly listingRepo: IListingRepository,
    private readonly businessRepo: IBusinessProfileRepository,
  ) {}

  async execute(id: string, requesterId: string, input: UpdateListingInput): Promise<Listing> {
    const listing = await this.listingRepo.findById(id);

    if (!listing) {
      throw new NotFoundException('Listing not found.');
    }

    await this.assertOwnership(listing.businessProfileId, requesterId);

    return this.listingRepo.update(id, input);
  }

  private async assertOwnership(businessProfileId: string, requesterId: string): Promise<void> {
    const profile = await this.businessRepo.findById(businessProfileId);

    if (!profile) {
      throw new NotFoundException('Business profile not found.');
    }

    if (profile.ownerId !== requesterId) {
      throw new ForbiddenException('You do not own this business profile.');
    }
  }
}
