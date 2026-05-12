import { AttributeDefinitionDto } from './attribute-definition.dto.js';

/**
 * Public representation of a category and its requirements.
 */
export class CategoryBlueprintResponse {
  /** The unique identifier of the category */
  id!: string;
  /** URL-friendly identifier */
  slug!: string;
  /** Display name */
  name!: string;
  /** List of attributes defined for this category */
  attributes!: AttributeDefinitionDto[];
}
