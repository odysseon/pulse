import { IsOptional, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateAttributeDto } from './create-category.dto.js';

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  name?: string;

  /**
   * Updating the blueprint.
   * Note: This usually replaces the entire attribute set
   * for that category in our Sync strategy.
   */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAttributeDto)
  attributes?: CreateAttributeDto[];
}
