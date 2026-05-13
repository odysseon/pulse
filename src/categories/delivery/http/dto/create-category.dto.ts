import {
  IsString,
  IsArray,
  ValidateNested,
  IsNotEmpty,
  IsBoolean,
  MinLength,
  MaxLength,
  ArrayMinSize,
  ArrayMaxSize,
  ValidateIf,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AttributeType } from '../../../../../generated/prisma/client.js';

export class CreateAttributeDto {
  /** @example "capacity" */
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'key must be at least 2 characters long' })
  @MaxLength(50, { message: 'key must not exceed 50 characters' })
  key!: string;

  /** @example "Guest Capacity" */
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'label must be at least 2 characters long' })
  @MaxLength(100, { message: 'label must not exceed 100 characters' })
  label!: string;

  /** @example "STRING" */
  @IsEnum(AttributeType, {
    message: `type must be one of: ${Object.values(AttributeType).join(', ')}`,
  })
  type!: AttributeType;

  /** @example false */
  @IsBoolean()
  @IsNotEmpty()
  isRequired!: boolean;

  /** @example ["Lekki", "Ikeja"] - only for SELECT type */
  @ValidateIf((o) => o.type === AttributeType.SELECT)
  @IsArray({ message: 'options must be an array when type is SELECT' })
  @ArrayMinSize(1, { message: 'options must have at least 1 item when type is SELECT' })
  @ArrayMaxSize(50, { message: 'options cannot exceed 50 items' })
  @IsString({ each: true, message: 'each option must be a string' })
  @MinLength(1, { each: true, message: 'each option must be at least 1 character long' })
  @MaxLength(100, { each: true, message: 'each option must not exceed 100 characters' })
  options?: string[];
}

export class CreateCategoryDto {
  /** @example "Event Centres" */
  @IsString()
  @IsNotEmpty({ message: 'name is required' })
  @MinLength(2, { message: 'name must be at least 2 characters long' })
  @MaxLength(100, { message: 'name must not exceed 100 characters' })
  name!: string;

  /** The list of rules for listings in this category */
  @IsArray({ message: 'attributes must be an array' })
  @ArrayMinSize(1, { message: 'at least one attribute is required' })
  @ArrayMaxSize(50, { message: 'cannot have more than 50 attributes' })
  @ValidateNested({ each: true })
  @Type(() => CreateAttributeDto)
  attributes!: CreateAttributeDto[];
}
