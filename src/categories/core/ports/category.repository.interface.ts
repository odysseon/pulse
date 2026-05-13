import { CategoryBlueprintResponse } from '../../delivery/http/dto/category-blueprint-response.dto.js';
import { CreateCategoryDto } from '../../delivery/http/dto/create-category.dto.js';
import { UpdateCategoryDto } from '../../delivery/http/dto/update-category.dto.js';

export const CATEGORY_REPOSITORY_TOKEN = Symbol('CATEGORY_REPOSITORY_TOKEN');

export interface ICategoryRepository {
  /**
   * Persists a new category and its attribute blueprint.
   */
  create(data: CreateCategoryDto): Promise<CategoryBlueprintResponse>;

  /**
   * Updates a category and syncs its attribute blueprint.
   */
  update(id: string, data: UpdateCategoryDto): Promise<CategoryBlueprintResponse>;

  /**
   * Hard deletes a category from the system.
   */
  delete(id: string): Promise<void>;
  findBySlug(slug: string): Promise<CategoryBlueprintResponse | null>;
  findById(id: string): Promise<CategoryBlueprintResponse | null>;
  findAll(): Promise<CategoryBlueprintResponse[]>;
}
