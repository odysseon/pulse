import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { ICategoryRepository } from '../core/ports/category.repository.interface.js';
import { CategoryBlueprintResponse } from '../delivery/http/dto/category-blueprint-response.dto.js';
import { Prisma } from '../../../generated/prisma/client.js';

type CategoryWithAttributes = Prisma.CategoryGetPayload<{
  include: { attributes: true };
}>;
@Injectable()
export class PrismaCategoryRepository implements ICategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retrieves a category and its full attribute blueprint via slug.
   */
  async findBySlug(slug: string): Promise<CategoryBlueprintResponse | null> {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        attributes: {
          orderBy: { key: 'asc' },
        },
      },
    });

    if (!category) return null;

    return this.mapToBlueprint(category);
  }

  /**
   * Retrieves a category blueprint by internal ID.
   */
  async findById(id: string): Promise<CategoryBlueprintResponse | null> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        attributes: true,
      },
    });

    if (!category) return null;

    return this.mapToBlueprint(category);
  }

  /**
   * Returns all categories for the discovery navigation.
   */
  async findAll(): Promise<CategoryBlueprintResponse[]> {
    const categories = await this.prisma.category.findMany({
      include: {
        attributes: true,
      },
      orderBy: { name: 'asc' },
    });

    return categories.map((cat) => this.mapToBlueprint(cat));
  }

  /**
   * Internal mapper to transform Prisma models into our deterministic DTO.
   */
  private mapToBlueprint(category: CategoryWithAttributes): CategoryBlueprintResponse {
    return {
      id: category.id,
      slug: category.slug,
      name: category.name,
      attributes: category.attributes.map((attr) => ({
        key: attr.key,
        label: attr.label,
        type: attr.type,
        isRequired: attr.isRequired,
        options: attr.options as string[] | undefined,
      })),
    };
  }
}
