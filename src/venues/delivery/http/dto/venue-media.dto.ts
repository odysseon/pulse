import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

export const MEDIA_TYPES = ['IMAGE', 'VIDEO'] as const;

// 2. Derive the TypeScript union type ('IMAGE' | 'VIDEO')
export type MediaTypeDto = (typeof MEDIA_TYPES)[number];
export class VenueMediaDto {
  /**
   * The public ID of the media asset in the CDN
   */
  @IsString()
  publicId!: string;

  /**
   * The CDN URL of the media asset
   */
  @IsString()
  url!: string;

  /**
   * The type of media
   * @example "IMAGE"
   */
  @ApiProperty({ enum: MEDIA_TYPES })
  @IsIn(MEDIA_TYPES)
  type!: MediaTypeDto;

  /**
   * Display order (0 is treated as the main image)
   * @example 0
   */
  @IsInt()
  @Min(0)
  order!: number;

  /**
   * Optional alt text or caption
   */
  @IsOptional()
  @IsString()
  caption?: string;
}
