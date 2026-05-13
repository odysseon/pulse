import { Injectable } from '@nestjs/common';
import { GetCategoryBlueprintUseCase } from './get-category-blueprint.use-case.js';
import { ListCategoriesUseCase } from './list-categories.use-case.js';
import { CategoryBlueprintResponse } from '../delivery/http/dto/category-blueprint-response.dto.js';
import { ValidateCategoryAttributesUseCase } from './validate-category-attributes.use-case.js';
import { CreateCategoryDto } from '../delivery/http/dto/create-category.dto.js';
import { CreateCategoryUseCase } from './create-category.use-case.js';
import { DeleteCategoryUseCase } from './delete-category.use-case.js';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly getBlueprintUseCase: GetCategoryBlueprintUseCase,
    private readonly listCategoriesUseCase: ListCategoriesUseCase,
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly validateAttributesUseCase: ValidateCategoryAttributesUseCase,
    private readonly deleteCategoryUseCase: DeleteCategoryUseCase,
  ) {}

  async getBlueprint(slug: string): Promise<CategoryBlueprintResponse> {
    return await this.getBlueprintUseCase.execute(slug);
  }

  async listCategories(): Promise<CategoryBlueprintResponse[]> {
    return await this.listCategoriesUseCase.execute();
  }

  async createCategory(payload: CreateCategoryDto): Promise<CategoryBlueprintResponse> {
    return await this.createCategoryUseCase.execute(payload);
  }

  async deleteCategory(categoryId: string): Promise<void> {
    return await this.deleteCategoryUseCase.execute(categoryId);
  }

  /**
   * Public validation method used by other domains (e.g., Listings)
   * during create/update operations.
   */
  async validateAttributes(categoryId: string, attributes: Record<string, any>): Promise<void> {
    return await this.validateAttributesUseCase.execute(categoryId, attributes);
  }
}
