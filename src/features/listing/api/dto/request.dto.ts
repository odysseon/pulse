import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Currency } from '../../domain/types/currency.enum.js';
import { ListingStatus } from '../../domain/types/listing-status.enum.js';

export class ListingPriceDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  maxPrice?: number;

  /**
   * Currency is required when any price is set.
   */
  @ValidateIf((o: ListingPriceDto) => o.minPrice !== undefined || o.maxPrice !== undefined)
  @IsEnum(Currency)
  currency?: Currency;

  @IsBoolean()
  isNegotiable!: boolean;
}

export class CreateListingDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ListingPriceDto)
  price?: ListingPriceDto;
}

export class UpdateListingDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ListingPriceDto)
  price?: ListingPriceDto;
}

export class TransitionListingStatusDto {
  @IsEnum(ListingStatus)
  status!: ListingStatus;
}

export class GetListingsQueryDto {
  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency;

  @IsOptional()
  @IsString()
  minPrice?: string;

  @IsOptional()
  @IsString()
  maxPrice?: string;

  @IsOptional()
  @IsString()
  isNegotiable?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;
}
