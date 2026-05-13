import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  CATEGORY_REPOSITORY_TOKEN,
  type ICategoryRepository,
} from '../core/ports/category.repository.interface.js';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class DeleteCategoryUseCase {
  constructor(
    @Inject(CATEGORY_REPOSITORY_TOKEN)
    private readonly repository: ICategoryRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(id: string) {
    // 1. Check if category exists
    const category = await this.repository.findById(id);
    if (!category) throw new NotFoundException('Category not found');

    // 2. Prevent deletion if listings exist
    const listingCount = await this.prisma.listing.count({
      where: { categoryId: id },
    });

    if (listingCount > 0) {
      throw new ConflictException(
        `Cannot delete category. It has ${listingCount} active listings.`,
      );
    }

    return this.repository.delete(id);
  }
}
