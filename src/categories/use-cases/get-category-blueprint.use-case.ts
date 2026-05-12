import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  CATEGORY_REPOSITORY_TOKEN,
  type ICategoryRepository,
} from '../core/ports/category.repository.interface.js';
import { CategoryBlueprintResponse } from '../delivery/http/dto/category-blueprint-response.dto.js';

/**
 * Business logic for retrieving a category's attribute blueprint.
 * This is used by the frontend to dynamically build search filters and forms.
 */
@Injectable()
export class GetCategoryBlueprintUseCase {
  constructor(
    @Inject(CATEGORY_REPOSITORY_TOKEN)
    private readonly repository: ICategoryRepository,
  ) {}

  /**
   * Orchestrates the retrieval of a category blueprint.
   * * @param slug - The URL-friendly identifier of the category (e.g., 'event-centres')
   * @returns The fully mapped category blueprint with its dynamic attribute rules
   * @throws NotFoundException if the category slug does not exist in the catalog
   */
  async execute(slug: string): Promise<CategoryBlueprintResponse> {
    const blueprint = await this.repository.findBySlug(slug);

    if (!blueprint) {
      throw new NotFoundException(`Category with slug "${slug}" not found.`);
    }

    return blueprint;
  }
}
