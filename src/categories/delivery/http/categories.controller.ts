import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CategoriesService } from '../../use-cases/categories.service.js';
import { Public } from '@odysseon/whoami-adapter-nestjs';
import { CategoryBlueprintResponse } from './dto/category-blueprint-response.dto.js';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  /**
   * Retrieves a specific category blueprint by its slug.
   * Used by the frontend to build dynamic forms and search filters.
   */
  @Public()
  @Get(':slug/blueprint')
  async getCategoryBlueprint(@Param('slug') slug: string): Promise<CategoryBlueprintResponse> {
    return await this.categoriesService.getBlueprint(slug);
  }

  /**
   * Lists all available categories.
   */
  @Public()
  @Get()
  async getCategories(): Promise<CategoryBlueprintResponse[]> {
    return await this.categoriesService.listCategories();
  }
}
