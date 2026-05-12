import { Inject, Injectable } from '@nestjs/common';
import {
  CATEGORY_REPOSITORY_TOKEN,
  type ICategoryRepository,
} from '../core/ports/category.repository.interface.js';
import { CategoryBlueprintResponse } from '../delivery/http/dto/category-blueprint-response.dto.js';

/**
 * Business logic for retrieving all available listing categories.
 * Provides the full catalog structure to the discovery layer.
 */
@Injectable()
export class ListCategoriesUseCase {
  constructor(
    @Inject(CATEGORY_REPOSITORY_TOKEN)
    private readonly repository: ICategoryRepository,
  ) {}

  /**
   * Executes the retrieval of the entire category catalog.
   *
   * @returns A list of all categories including their attribute blueprints.
   */
  async execute(): Promise<CategoryBlueprintResponse[]> {
    return this.repository.findAll();
  }
}
