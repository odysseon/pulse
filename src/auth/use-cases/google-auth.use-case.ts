import {
  Injectable,
  Inject,
  Logger,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client, VerifyIdTokenOptions } from 'google-auth-library';
import { moduleToken } from '@odysseon/whoami-adapter-nestjs';
import type { OAuthMethods } from '@odysseon/whoami-core/oauth';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AppConfig } from '../../configs/validation.js';
import { USER_REPOSITORY_TOKEN } from '../../users/core/ports/user.repository.interface.js';
import type { IUserRepository } from '../../users/core/ports/user.repository.interface.js';
import { randomBytes } from 'crypto';

@Injectable()
export class GoogleAuthUseCase {
  private readonly logger = new Logger(GoogleAuthUseCase.name);
  private readonly googleClient: OAuth2Client;
  private readonly clientId: string | undefined;

  constructor(
    @Inject(moduleToken('oauth'))
    private readonly oauth: OAuthMethods,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService<AppConfig>,
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
  ) {
    this.clientId = this.configService.get('GOOGLE_CLIENT_ID');
    this.googleClient = new OAuth2Client(this.clientId);
  }

  async execute(idToken: string) {
    let payload;
    try {
      const verifyOptions: VerifyIdTokenOptions = { idToken };
      if (this.clientId) {
        verifyOptions.audience = this.clientId;
      }
      const ticket = await this.googleClient.verifyIdToken(verifyOptions);
      payload = ticket.getPayload();
    } catch (error) {
      this.logger.warn(`Failed to verify Google ID token: ${(error as Error).message}`);
      throw new UnauthorizedException('Invalid Google ID Token');
    }

    if (!payload || !payload.sub || !payload.email) {
      throw new UnauthorizedException('Invalid Google ID Token payload');
    }

    const { email, sub: googleId } = payload;

    // 1. Authenticate or create account via OAuth
    const { account, receipt, isNewAccount } = await this.oauth.authenticateWithOAuth({
      provider: 'google',
      providerId: googleId,
      email,
    });

    try {
      // 2. If new account, create domain User profile
      if (isNewAccount) {
        // Auto-generate username from email + 2 random bytes
        const base = (email.split('@')[0] || 'user').toLowerCase().replace(/[^a-z0-9]/g, '');
        const suffix = randomBytes(2).toString('hex');
        const username = `${base}${suffix}`;

        await this.userRepository.create(account.id, username);
      }
    } catch (error) {
      this.logger.error(
        `Failed to create domain user for new Google account ${account.email}`,
        error,
      );

      // Rollback orphaned account if domain user creation fails
      if (isNewAccount) {
        await this.prisma.account
          .delete({ where: { id: account.id } })
          .catch((err) =>
            this.logger.error(`FATAL: Failed to rollback orphaned account ${account.id}`, err),
          );
      }

      throw new InternalServerErrorException('Failed to complete user registration');
    }

    return {
      token: receipt.token,
      expiresAt: receipt.expiresAt,
    };
  }

  async link(idToken: string, accountId: string): Promise<void> {
    let payload;
    try {
      const verifyOptions: VerifyIdTokenOptions = { idToken };
      if (this.clientId) {
        verifyOptions.audience = this.clientId;
      }
      const ticket = await this.googleClient.verifyIdToken(verifyOptions);
      payload = ticket.getPayload();
    } catch (error) {
      this.logger.warn(`Failed to verify Google ID token for linking: ${(error as Error).message}`);
      throw new UnauthorizedException('Invalid Google ID Token');
    }

    if (!payload || !payload.sub) {
      throw new UnauthorizedException('Invalid Google ID Token payload');
    }

    await this.oauth.linkOAuthToAccount({
      accountId,
      provider: 'google',
      providerId: payload.sub,
    });
  }
}
