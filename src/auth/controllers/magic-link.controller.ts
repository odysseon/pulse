import { Body, Controller, Inject, Post, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Public, moduleToken } from '@odysseon/whoami-adapter-nestjs';
import type { MagicLinkMethods } from '@odysseon/whoami-core/magiclink';
import {
  RequestMagicLinkDto,
  AuthenticateMagicLinkDto,
  RequestMagicLinkResponseDto,
  ReceiptTokenResponse,
} from '../dto/index.js';
import { MailQueueService } from '../../mail/mail-queue.service.js';

@ApiTags('Magic Link Authentication')
@Controller('auth/magic-link')
export class MagicLinkController {
  constructor(
    @Inject(moduleToken('magiclink'))
    private readonly magicLink: MagicLinkMethods,
    private readonly mailQueueService: MailQueueService,
  ) {}

  @ApiOperation({ summary: 'Request a magic link for login' })
  @ApiBody({ type: RequestMagicLinkDto })
  @ApiOkResponse({ type: RequestMagicLinkResponseDto })
  @Public()
  @Post('request')
  @HttpCode(HttpStatus.OK)
  async requestMagicLink(@Body() dto: RequestMagicLinkDto): Promise<RequestMagicLinkResponseDto> {
    const { plainTextToken, isNewAccount } = await this.magicLink.requestMagicLink({
      email: dto.email,
    });

    const magicLinkUrl = `http://localhost:3000/auth/magic-link/callback?token=${plainTextToken}`;

    await this.mailQueueService.enqueueMail({
      to: dto.email,
      subject: 'Your Magic Link to Login',
      template: 'magic-link',
      context: {
        url: magicLinkUrl,
        email: dto.email,
      },
    });

    return {
      isNewAccount,
      message: 'If an account exists, a magic link has been sent to your email.',
    };
  }

  @ApiOperation({ summary: 'Authenticate with a magic link token' })
  @ApiBody({ type: AuthenticateMagicLinkDto })
  @ApiOkResponse({ type: ReceiptTokenResponse })
  @ApiUnauthorizedResponse({ description: 'Invalid or expired magic link' })
  @Public()
  @Post('authenticate')
  @HttpCode(HttpStatus.OK)
  async authenticate(@Body() dto: AuthenticateMagicLinkDto): Promise<ReceiptTokenResponse> {
    const { receipt } = await this.magicLink.authenticateWithMagicLink({
      token: dto.token,
    });

    return {
      token: receipt.token,
      expiresAt: receipt.expiresAt,
    };
  }
}
