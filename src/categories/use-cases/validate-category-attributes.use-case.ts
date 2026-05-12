import { Inject, Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import {
  CATEGORY_REPOSITORY_TOKEN,
  type ICategoryRepository,
} from '../core/ports/category.repository.interface.js';
import { ATTRIBUTE_TYPES } from '../../shared/domain/listing.constants.js';

/**
 * Business logic for validating a dynamic attributes payload against a category blueprint.
 * Ensures data integrity before listings are persisted to the database.
 */
@Injectable()
export class ValidateCategoryAttributesUseCase {
  constructor(
    @Inject(CATEGORY_REPOSITORY_TOKEN)
    private readonly repository: ICategoryRepository,
  ) {}

  /**
   * Executes the validation logic.
   *
   * @param categoryId - The internal ID of the category to validate against.
   * @param attributes - The dynamic key-value pairs provided by the user.
   * @throws NotFoundException if the category does not exist.
   * @throws BadRequestException if validation fails for any attribute.
   */
  async execute(categoryId: string, attributes: Record<string, any>): Promise<void> {
    const blueprint = await this.repository.findById(categoryId);

    if (!blueprint) {
      throw new NotFoundException(`Category blueprint with ID "${categoryId}" not found.`);
    }

    for (const rule of blueprint.attributes) {
      const value = attributes[rule.key];

      // 1. Requirement Check
      if (rule.isRequired && (value === undefined || value === null)) {
        throw new BadRequestException(`Attribute "${rule.key}" (${rule.label}) is required.`);
      }

      // Skip type checks if value is missing and not required
      if (value === undefined || value === null) continue;

      // 2. Strict Type Enforcement
      switch (rule.type) {
        case ATTRIBUTE_TYPES.NUMBER:
          if (typeof value !== 'number') {
            throw new BadRequestException(`Attribute "${rule.key}" must be a number.`);
          }
          break;

        case ATTRIBUTE_TYPES.BOOLEAN:
          if (typeof value !== 'boolean') {
            throw new BadRequestException(`Attribute "${rule.key}" must be a boolean.`);
          }
          break;

        case ATTRIBUTE_TYPES.STRING:
          if (typeof value !== 'string') {
            throw new BadRequestException(`Attribute "${rule.key}" must be a string.`);
          }
          break;

        case ATTRIBUTE_TYPES.SELECT:
          if (!rule.options?.includes(value as string)) {
            throw new BadRequestException(
              `Invalid value for "${rule.key}". Expected one of: ${rule.options?.join(', ')}`,
            );
          }
          break;
      }
    }

    const allowedKeys = blueprint.attributes.map((a) => a.key);
    const incomingKeys = Object.keys(attributes);
    const rogueKeys = incomingKeys.filter((key) => !allowedKeys.includes(key));

    if (rogueKeys.length > 0) {
      throw new BadRequestException(
        `The following attributes are not allowed in this category: ${rogueKeys.join(', ')}`,
      );
    }
  }
}
