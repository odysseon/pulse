import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AuthenticateGoogleDto {
  @ApiProperty({ description: 'The Google ID Token received from the client' })
  @IsString()
  @IsNotEmpty()
  idToken!: string;
}

export class LinkGoogleDto {
  /**
   * The Google ID token.
   */
  @IsString()
  @IsNotEmpty()
  idToken!: string;
}
