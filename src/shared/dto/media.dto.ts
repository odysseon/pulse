import { IsNumber, IsString } from 'class-validator';

export class MediaDto {
  @IsString()
  url!: string;

  @IsString()
  publicId!: string;

  @IsNumber()
  order!: number;
}
