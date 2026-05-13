import { AttributeType } from '../../../../shared/domain/listing.constants.js';

export class CreateAttributeDto {
  /** @example "capacity" */
  key!: string;
  /** @example "Guest Capacity" */
  label!: string;
  /** @example "NUMBER" */
  type!: AttributeType;
  /** @example false */
  isRequired!: boolean;
  /** @example ["Lekki", "Ikeja"] - only for SELECT type */
  options?: string[];
}

export class CreateCategoryDto {
  /** @example "Event Centres" */
  name!: string;
  /** @example "event-centres" */
  slug!: string;
  /** The list of rules for listings in this category */
  attributes!: CreateAttributeDto[];
}
