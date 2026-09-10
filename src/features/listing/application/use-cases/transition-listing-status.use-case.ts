import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { IListingRepository } from '../../domain/ports/listing.repository.port.js';
import { IBusinessProfileRepository } from '../../../business-profile/domain/ports/business-profile.repository.port.js';
import { ListingStatus } from '../../domain/types/listing-status.enum.js';
import { Listing } from '../../domain/types/listing.entity.js';
import { ListingPublicationValidator } from '../services/listing-publication-validator.service.js';
import { ListingPublicationPolicy } from '../../domain/policies/listing-publication.policy.js';
import { EventBusService } from '../../../../shared/events/event-bus.service.js';
import { ListingStatusChangedEvent } from '../../../../shared/events/listing.events.js';

/**
 * Valid lifecycle transitions.
 *
 * DRAFT     → PUBLISHED, ARCHIVED
 * PUBLISHED → PAUSED, ARCHIVED
 * PAUSED    → PUBLISHED, ARCHIVED
 * ARCHIVED  → (terminal — no transitions out)
 */
const ALLOWED_TRANSITIONS: Record<ListingStatus, ListingStatus[]> = {
  [ListingStatus.DRAFT]: [ListingStatus.PUBLISHED, ListingStatus.ARCHIVED],
  [ListingStatus.PUBLISHED]: [ListingStatus.PAUSED, ListingStatus.ARCHIVED],
  [ListingStatus.PAUSED]: [ListingStatus.PUBLISHED, ListingStatus.ARCHIVED],
  [ListingStatus.ARCHIVED]: [],
};

@Injectable()
export class TransitionListingStatusUseCase {
  constructor(
    private readonly listingRepo: IListingRepository,
    private readonly businessRepo: IBusinessProfileRepository,
    private readonly publicationValidator: ListingPublicationValidator,
    private readonly eventBus: EventBusService,
  ) {}

  async execute(id: string, requesterId: string, targetStatus: ListingStatus): Promise<Listing> {
    const listing = await this.listingRepo.findById(id);

    if (!listing) {
      throw new NotFoundException('Listing not found.');
    }

    await this.assertOwnership(listing.businessProfileId, requesterId);

    const allowed = ALLOWED_TRANSITIONS[listing.status];

    if (!allowed.includes(targetStatus)) {
      throw new BadRequestException(
        `Cannot transition listing from ${listing.status} to ${targetStatus}.`,
      );
    }

    if (targetStatus === ListingStatus.PUBLISHED) {
      const parentBusiness = await this.businessRepo.findById(listing.businessProfileId);
      if (!parentBusiness) throw new NotFoundException('Parent business profile not found.');

      const validationResult = ListingPublicationPolicy.validate(listing, parentBusiness);
      if (!validationResult.isValid()) {
        throw new BadRequestException({
          message: 'Listing is not ready for publication.',
          issues: validationResult.errors,
        });
      }

      await this.publicationValidator.validate(listing);
    }

    const oldStatus = listing.status;

    const updatedListing = await this.listingRepo.transitionStatus(id, { status: targetStatus });

    await this.eventBus.publish(
      'listing.status.changed',
      new ListingStatusChangedEvent(
        updatedListing.id,
        updatedListing.businessProfileId,
        oldStatus,
        targetStatus,
      ),
      requesterId,
    );

    return updatedListing;
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
