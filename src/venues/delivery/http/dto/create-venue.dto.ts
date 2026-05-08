import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  IsNumber,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { VenueMediaDto } from './venue-media.dto.js';
import { PerkDto } from './perk.dto.js';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Payload for Venue Owners to list a new Event Centre.
 */
export class CreateVenueDto {
  /**
   * Official name of the event centre
   */
  @IsString()
  name!: string;

  /**
   * Detailed description of the venue
   */
  @IsOptional()
  @IsString()
  description?: string;

  /**
   * Macro-location for easy filtering
   * @example "Lekki"
   */
  @IsString()
  location!: string;

  /**
   * Full street address
   */
  @IsString()
  address!: string;

  /**
   * Maximum guest capacity
   * @example 1000
   */
  @IsInt()
  @Min(1)
  capacity!: number;

  /**
   * Minimum starting price
   */
  @IsOptional()
  @IsNumber()
  @Min(0)
  priceRangeMin?: number;

  /**
   * Maximum expected price
   */
  @IsOptional()
  @IsNumber()
  @Min(0)
  priceRangeMax?: number;

  /**
   * Direct contact number (Standard calls)
   */
  @IsOptional()
  @IsString()
  contactPhone?: string;

  /**
   * Direct WhatsApp number for fast conversion
   */
  @IsOptional()
  @IsString()
  contactWhatsapp?: string;

  /**
   * List of amenity names to link or create
   * @example ["Parking", "AC", "Security"]
   */
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];

  /**
   * Ordered list of media assets
   */
  @ApiProperty({ type: () => VenueMediaDto, isArray: true, required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VenueMediaDto)
  media?: VenueMediaDto[];

  /**
   * Value-add perks included with the venue
   */
  @ApiProperty({ type: () => PerkDto, isArray: true, required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PerkDto)
  perks?: PerkDto[];
}
