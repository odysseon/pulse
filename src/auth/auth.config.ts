import { ConfigService } from '@nestjs/config';
import { WhoamiModuleAsyncOptions, WhoamiModuleOptions } from '@odysseon/whoami-adapter-nestjs';
import {
  JoseReceiptVerifier,
  JoseReceiptSigner,
  JoseReceiptConfig,
} from '@odysseon/whoami-adapter-jose';
import { PasswordModule } from '@odysseon/whoami-core/password';
import { MagicLinkModule } from '@odysseon/whoami-core/magiclink';
import { PrismaService } from '../prisma/prisma.service.js';
import { passwordConfig, joseConfig } from './password.config.js';
import { magicLinkConfig } from './magic-link.config.js';

export const whoamiConfig: WhoamiModuleAsyncOptions = {
  inject: [ConfigService, PrismaService],
  useFactory: (...args: unknown[]): WhoamiModuleOptions => {
    const [configService, prismaService] = args as [ConfigService, PrismaService];
    const receiptSecret = configService.getOrThrow<string>('RECEIPT_SECRET');

    const joseConfigWithSecret: JoseReceiptConfig = {
      ...joseConfig,
      secret: receiptSecret,
    };

    const receiptVerifier = new JoseReceiptVerifier(joseConfigWithSecret);
    const receiptSigner = new JoseReceiptSigner(joseConfigWithSecret);

    const passConfig = passwordConfig(prismaService, receiptSigner);
    const mlConfig = magicLinkConfig(prismaService, receiptSigner);

    return {
      receiptVerifier,
      modules: [PasswordModule(passConfig), MagicLinkModule(mlConfig)],
    };
  },
};
