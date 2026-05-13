import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CategoriesService } from '../../use-cases/categories.service.js';
import { Public } from '@odysseon/whoami-adapter-nestjs';
import { CategoryBlueprintResponse } from './dto/category-blueprint-response.dto.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { AdminGuard } from '../../../shared/decorators/admin-guard.decorator.js';

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

  @Post()
  @AdminGuard()
  async create(@Body() payload: CreateCategoryDto): Promise<CategoryBlueprintResponse> {
    return this.categoriesService.createCategory(payload);
  }

  @Delete(':id')
  @AdminGuard()
  async remove(@Param('id') id: string) {
    return this.categoriesService.deleteCategory(id);
  }
}
