import { createPrismaAdapters } from '@odysseon/whoami-adapter-prisma';
import { OAuthModuleConfig } from '@odysseon/whoami-core/oauth';
import { PrismaService } from '../prisma/prisma.service.js';
import { JoseReceiptSigner } from '@odysseon/whoami-adapter-jose';
import { UuidGenerator, NestLoggerAdapter } from './auth.adapters.js';

export function oauthConfig(
  prismaService: PrismaService,
  receiptSigner: JoseReceiptSigner,
): OAuthModuleConfig {
  const idGenerator = new UuidGenerator();
  const logger = new NestLoggerAdapter('OAuthModule');

  // Extracts accountRepo and oauthStore
  const { accountRepo, oauthStore } = createPrismaAdapters(prismaService);

  return {
    accountRepo,
    oauthStore,
    idGenerator,
    receiptSigner,
    logger,
    tokenLifespanMinutes: 600, // JWT validity for OAuth login (10 hours)
  };
}
