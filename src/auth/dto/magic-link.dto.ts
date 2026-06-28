import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class RequestMagicLinkDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'The email address to send the magic link to',
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;
}

export class AuthenticateMagicLinkDto {
  @ApiProperty({
    example: '...',
    description: 'The magic link token received in the email',
  })
  @IsString()
  @IsNotEmpty()
  token!: string;
}

export class RequestMagicLinkResponseDto {
  @ApiProperty({
    description: 'Whether the email belongs to a new account',
  })
  isNewAccount!: boolean;

  @ApiProperty({
    description: 'Message indicating the email was sent',
  })
  message!: string;
}
