import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  CATEGORY_REPOSITORY_TOKEN,
  type ICategoryRepository,
} from '../core/ports/category.repository.interface.js';
import { UpdateCategoryDto } from '../delivery/http/dto/update-category.dto.js';

@Injectable()
export class UpdateCategoryUseCase {
  constructor(
    @Inject(CATEGORY_REPOSITORY_TOKEN)
    private readonly repository: ICategoryRepository,
  ) {}

  async execute(id: string, payload: UpdateCategoryDto) {
    const category = await this.repository.findById(id);
    if (!category) throw new NotFoundException('Category not found');

    return this.repository.update(id, payload);
  }
}
