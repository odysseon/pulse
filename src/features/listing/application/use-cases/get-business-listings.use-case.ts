import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { IListingRepository } from '../../domain/ports/listing.repository.port.js';
import { IBusinessProfileRepository } from '../../../business-profile/domain/ports/business-profile.repository.port.js';
import { Listing } from '../../domain/types/listing.entity.js';

@Injectable()
export class GetBusinessListingsUseCase {
  constructor(
    private readonly listingRepo: IListingRepository,
    private readonly businessRepo: IBusinessProfileRepository,
  ) {}

  async execute(businessProfileId: string, requesterId: string): Promise<Listing[]> {
    const profile = await this.businessRepo.findById(businessProfileId);

    if (!profile) {
      throw new NotFoundException('Business profile not found.');
    }

    if (profile.ownerId !== requesterId) {
      throw new ForbiddenException('You do not own this business profile.');
    }

    return this.listingRepo.findByBusinessProfile(businessProfileId);
  }
}
