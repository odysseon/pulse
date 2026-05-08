import { IsOptional, IsString, IsInt, Min, IsArray, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Query parameters for discovering and filtering event centres.
 * Optimized for the public discovery loop.
 */
export class GetVenuesFilterDto {
  /**
   * Filter by broad location identifier (e.g., "Ikeja", "Lekki")
   * @example "Ikeja"
   */
  @IsOptional()
  @IsString()
  location?: string;

  /**
   * Minimum guest capacity required
   * @example 500
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  minCapacity?: number;

  /**
   * Maximum budget constraint
   * @example 1500000
   */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  /**
   * List of required amenities
   * @example ["Parking", "Generator"]
   */
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];

  /**
   * Page number for pagination
   * @example 1
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  /**
   * Number of items per page
   * @example 20
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}
