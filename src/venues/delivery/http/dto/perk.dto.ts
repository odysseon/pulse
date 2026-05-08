import { IsOptional, IsString } from 'class-validator';

export class PerkDto {
  /**
   * Title of the perk
   * @example "Free Photography"
   */
  @IsString()
  title!: string;

  /**
   * Detailed description of the included perk
   * @example "6 hours of event coverage included in the booking"
   */
  @IsOptional()
  @IsString()
  description?: string;
}
