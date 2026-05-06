import { Body, Controller, Inject, Post, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Public, moduleToken } from '@odysseon/whoami-adapter-nestjs';
import type { PasswordMethods } from '@odysseon/whoami-core/password';
import { LoginPasswordDto, ReceiptTokenResponse } from '../dto/index.js';

@ApiTags('Password Authentication')
@Controller('auth')
export class PasswordAuthController {
  constructor(
    @Inject(moduleToken('password'))
    private readonly password: PasswordMethods,
  ) {}

  @ApiOperation({ summary: 'Login with email + password' })
  @ApiBody({ type: LoginPasswordDto })
  @ApiOkResponse({ type: ReceiptTokenResponse })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async loginPassword(@Body() dto: LoginPasswordDto): Promise<ReceiptTokenResponse> {
    const { receipt } = await this.password.authenticateWithPassword({
      email: dto.email,
      password: dto.password,
    });
    return { token: receipt.token, expiresAt: receipt.expiresAt };
  }
}
