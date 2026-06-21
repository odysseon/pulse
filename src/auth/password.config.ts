import { createPrismaAdapters } from '@odysseon/whoami-adapter-prisma';
import { PasswordModuleConfig } from '@odysseon/whoami-core/password';
import { PrismaService } from '../prisma/prisma.service.js';
import { Argon2PasswordHasher } from '@odysseon/whoami-adapter-argon2';
import { JoseReceiptConfig, JoseReceiptSigner } from '@odysseon/whoami-adapter-jose';
import { WebCryptoSecureTokenAdapter } from '@odysseon/whoami-adapter-webcrypto';
import { UuidGenerator, SystemClock, NestLoggerAdapter } from './auth.adapters.js';

export const joseConfig: Omit<JoseReceiptConfig, 'secret'> = {
  issuer: 'show',
  audience: 'password-users',
};

export function passwordConfig(
  prismaService: PrismaService,
  receiptSigner: JoseReceiptSigner,
): PasswordModuleConfig {
  const idGenerator = new UuidGenerator();
  const clock = new SystemClock();
  const passwordHasher = new Argon2PasswordHasher();
  const secureToken = new WebCryptoSecureTokenAdapter();
  const logger = new NestLoggerAdapter('PasswordModule');

  const { accountRepo, passwordHashStore, resetTokenStore } = createPrismaAdapters(prismaService);

  return {
    accountRepo,
    passwordHashStore,
    passwordHasher,
    idGenerator,
    clock,
    tokenLifespanMinutes: 600,
    resetTokenLifespanMinutes: 60,
    receiptSigner,
    resetTokenStore,
    secureToken,
    logger,
  };
}
