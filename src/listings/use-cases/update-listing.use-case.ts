import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  LISTING_REPOSITORY_TOKEN,
  type IListingRepository,
} from '../core/ports/listing.repository.interface.js';
import { ValidateCategoryAttributesUseCase } from '../../categories/use-cases/validate-category-attributes.use-case.js';
import { UpdateListingDto } from '../delivery/http/dto/update-listing.dto.js';
import { ListingView } from '../core/domain/listing.view.js';

@Injectable()
export class UpdateListingUseCase {
  constructor(
    @Inject(LISTING_REPOSITORY_TOKEN)
    private readonly repository: IListingRepository,
    private readonly validateAttributes: ValidateCategoryAttributesUseCase,
  ) {}

  /**
   * Executes a partial update on a listing.
   * Ensures the requester is the owner and the data obeys category rules.
   */
  async execute(
    listingId: string,
    accountId: string,
    payload: UpdateListingDto,
  ): Promise<ListingView> {
    // 1. Fetch current state to identify the Category for validation
    const existing = await this.repository.findById(listingId);

    if (!existing) {
      throw new NotFoundException('Listing not found');
    }

    // 2. Business Logic Validation: Dynamic Attributes
    // If the user is updating attributes, they must be checked against the blueprint.
    if (payload.attributes) {
      // Merge strategy: We merge new attributes into existing ones for validation
      const mergedAttributes = {
        ...existing.attributes,
        ...payload.attributes,
      };

      await this.validateAttributes.execute(existing.category.id, mergedAttributes);
    }

    // 3. Delegate to Repository for Persistence
    // The repository handles the ownership check and media cleanup internally.
    return this.repository.update(listingId, accountId, payload);
  }
}
