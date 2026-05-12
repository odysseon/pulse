import { CategoryBlueprintResponse } from '../../delivery/http/dto/category-blueprint-response.dto.js';

export const CATEGORY_REPOSITORY_TOKEN = Symbol('CATEGORY_REPOSITORY_TOKEN');

export interface ICategoryRepository {
  findBySlug(slug: string): Promise<CategoryBlueprintResponse | null>;
  findById(id: string): Promise<CategoryBlueprintResponse | null>;
  findAll(): Promise<CategoryBlueprintResponse[]>;
}
