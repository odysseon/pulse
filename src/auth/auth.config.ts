import { JoseReceiptVerifier } from '@odysseon/whoami-adapter-jose';
import { WhoamiModuleOptions } from '@odysseon/whoami-adapter-nestjs';
import { joseConfig, passwordConfig } from './password.config.js';
import { PasswordModule } from '@odysseon/whoami-core/password';

const receiptVerifier = new JoseReceiptVerifier(joseConfig);

export const whoamiConfig: WhoamiModuleOptions = {
  receiptVerifier,
  modules: [PasswordModule(passwordConfig)],
};
