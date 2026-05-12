import { Module } from '@nestjs/common';
import { CategoriesController } from './delivery/http/categories.controller.js';
import { CategoriesService } from './use-cases/categories.service.js';
import { GetCategoryBlueprintUseCase } from './use-cases/get-category-blueprint.use-case.js';
import { ListCategoriesUseCase } from './use-cases/list-categories.use-case.js';
import { ValidateCategoryAttributesUseCase } from './use-cases/validate-category-attributes.use-case.js';
import { PrismaCategoryRepository } from './infrastructure/prisma-category.repository.js';
import { CATEGORY_REPOSITORY_TOKEN } from './core/ports/category.repository.interface.js';

/**
 * The Categories Module manages the "Blueprint" system.
 * It serves as the source of truth for the structure of all listings
 * and provides validation logic used across the platform.
 */
@Module({
  controllers: [CategoriesController],
  providers: [
    CategoriesService,

    GetCategoryBlueprintUseCase,
    ListCategoriesUseCase,
    ValidateCategoryAttributesUseCase,

    {
      provide: CATEGORY_REPOSITORY_TOKEN,
      useClass: PrismaCategoryRepository,
    },
  ],
  exports: [
    /** * Exporting the service so the Listings module can
     * call 'validateAttributes' during listing creation.
     */
    CategoriesService,
  ],
})
export class CategoriesModule {}
