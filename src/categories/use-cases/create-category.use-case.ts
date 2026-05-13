import { Inject, Injectable } from '@nestjs/common';
import {
  CATEGORY_REPOSITORY_TOKEN,
  type ICategoryRepository,
} from '../core/ports/category.repository.interface.js';
import { CreateCategoryDto } from '../delivery/http/dto/create-category.dto.js';
import { CategoryBlueprintResponse } from '../delivery/http/dto/category-blueprint-response.dto.js';

@Injectable()
export class CreateCategoryUseCase {
  constructor(
    @Inject(CATEGORY_REPOSITORY_TOKEN)
    private readonly repository: ICategoryRepository,
  ) {}

  async execute(payload: CreateCategoryDto): Promise<CategoryBlueprintResponse> {
    return this.repository.create(payload);
  }
}
