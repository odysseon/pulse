import { createPrismaAdapters } from '@odysseon/whoami-adapter-prisma';
import { MagicLinkModuleConfig } from '@odysseon/whoami-core/magiclink';
import { PrismaService } from '../prisma/prisma.service.js';
import { JoseReceiptSigner } from '@odysseon/whoami-adapter-jose';
import { WebCryptoSecureTokenAdapter } from '@odysseon/whoami-adapter-webcrypto';
import { UuidGenerator, SystemClock, NestLoggerAdapter } from './auth.adapters.js';

export function magicLinkConfig(
  prismaService: PrismaService,
  receiptSigner: JoseReceiptSigner,
): MagicLinkModuleConfig {
  const idGenerator = new UuidGenerator();
  const clock = new SystemClock();
  const secureToken = new WebCryptoSecureTokenAdapter();
  const logger = new NestLoggerAdapter('MagicLinkModule');

  const { accountRepo, magicLinkStore } = createPrismaAdapters(prismaService);

  return {
    accountRepo,
    magicLinkStore,
    receiptSigner,
    idGenerator,
    clock,
    secureToken,
    logger,
    tokenLifespanMinutes: 15,
    receiptLifespanMinutes: 600, // Matching password config receipt duration
  };
}
