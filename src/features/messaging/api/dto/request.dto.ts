import { IsString, IsOptional, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateConversationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  businessProfileId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  listingId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  initialMessage!: string;
}

export class SendMessageDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mediaUrl?: string;

  @ApiPropertyOptional({ enum: ['IMAGE', 'VIDEO'] })
  @IsOptional()
  @IsEnum(['IMAGE', 'VIDEO'])
  mediaType?: 'IMAGE' | 'VIDEO';
}

export class UpdateConversationStatusDto {
  @ApiProperty({ enum: ['ACTIVE', 'CLOSED'] })
  @IsEnum(['ACTIVE', 'CLOSED'])
  status!: 'ACTIVE' | 'CLOSED';
}

export class MarkMessagesReadDto {
  @ApiProperty({ type: [String] })
  @IsString({ each: true })
  messageIds!: string[];
}
