import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { ICategoryRepository } from '../core/ports/category.repository.interface.js';
import { CategoryBlueprintResponse } from '../delivery/http/dto/category-blueprint-response.dto.js';
import { Prisma } from '../../../generated/prisma/client.js';
import { CreateCategoryDto } from '../delivery/http/dto/create-category.dto.js';
import slugify from 'slugify';

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

  async create(data: CreateCategoryDto): Promise<CategoryBlueprintResponse> {
    // Generate a clean, SEO-friendly slug
    const slug = slugify(data.name, {
      lower: true, // Convert to lower case
      strict: true, // Strip special characters except replacement
      trim: true, // Trim leading and trailing replacement chars
    });

    try {
      const created = await this.prisma.category.create({
        data: {
          name: data.name,
          slug,
          attributes: {
            create: data.attributes.map((attr) => ({
              key: attr.key,
              label: attr.label,
              type: attr.type,
              isRequired: attr.isRequired,
              options: attr.options ?? undefined,
            })),
          },
        },
        include: {
          attributes: true,
        },
      });

      return this.mapToBlueprint(created);
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(`Category with slug "${slug}" already exists.`);
        }
      }
      throw error;
    }
  }

  async update(id: string, data: Partial<CreateCategoryDto>): Promise<CategoryBlueprintResponse> {
    const updated = await this.prisma.category.update({
      where: { id },
      data: {
        name: data.name,
        attributes: data.attributes
          ? {
              deleteMany: {},
              create: data.attributes.map((attr) => ({
                key: attr.key,
                label: attr.label,
                type: attr.type,
                isRequired: attr.isRequired,
                options: attr.options ?? undefined,
              })),
            }
          : undefined,
      },
      include: { attributes: true },
    });

    return this.mapToBlueprint(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.category.delete({
      where: { id },
    });
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
