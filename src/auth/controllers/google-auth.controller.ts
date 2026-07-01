import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiOkResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Public } from '@odysseon/whoami-adapter-nestjs';
import { AuthenticateGoogleDto } from '../dto/google-auth.dto.js';
import { ReceiptTokenResponse } from '../dto/receipt.dto.js';
import { GoogleAuthUseCase } from '../use-cases/google-auth.use-case.js';

@ApiTags('Google Authentication')
@Controller('auth/google')
export class GoogleAuthController {
  constructor(private readonly googleAuthUseCase: GoogleAuthUseCase) {}

  @ApiOperation({ summary: 'Authenticate using a Google ID token' })
  @ApiBody({ type: AuthenticateGoogleDto })
  @ApiOkResponse({ type: ReceiptTokenResponse })
  @ApiUnauthorizedResponse({ description: 'Invalid Google ID token' })
  @Public()
  @Post()
  @HttpCode(HttpStatus.OK)
  async authenticate(@Body() dto: AuthenticateGoogleDto): Promise<ReceiptTokenResponse> {
    return this.googleAuthUseCase.execute(dto.idToken);
  }
}
