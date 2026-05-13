import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  LISTING_REPOSITORY_TOKEN,
  type IListingRepository,
} from '../core/ports/listing.repository.interface.js';
import { ValidateCategoryAttributesUseCase } from '../../categories/use-cases/validate-category-attributes.use-case.js';
import { UpdateListingDto } from '../delivery/http/dto/update-listing.dto.js';
import { ListingView, type DynamicAttributes } from '../core/domain/listing.view.js';

@Injectable()
export class UpdateListingUseCase {
  constructor(
    @Inject(LISTING_REPOSITORY_TOKEN)
    private readonly repository: IListingRepository,
    private readonly validateAttributes: ValidateCategoryAttributesUseCase,
  ) {}

  async execute(
    listingId: string,
    accountId: string,
    payload: UpdateListingDto,
  ): Promise<ListingView> {
    const existing = await this.repository.findById(listingId);

    if (!existing) {
      throw new NotFoundException('Listing not found');
    }

    let finalAttributes: DynamicAttributes | undefined = undefined;

    const targetCategoryId = payload.categoryId || existing.category.id;
    const isCategoryChanging = payload.categoryId && payload.categoryId !== existing.category.id;

    if (isCategoryChanging) {
      // SCENARIO 1: Category swap - Wipe old attributes and validate new ones strictly
      const newAttributes = payload.attributes || {};
      await this.validateAttributes.execute(targetCategoryId, newAttributes);
      finalAttributes = newAttributes;
    } else if (payload.attributes) {
      // SCENARIO 2: Same category - Merge new attributes into existing ones
      finalAttributes = {
        ...existing.attributes,
        ...payload.attributes,
      };
      await this.validateAttributes.execute(existing.category.id, finalAttributes);
    }

    // Build the final payload for the repository
    const finalPayload = {
      ...payload,
      ...(finalAttributes ? { attributes: finalAttributes } : {}),
    };

    return this.repository.update(listingId, accountId, finalPayload);
  }
}
