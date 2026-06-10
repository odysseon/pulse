import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailAdapter } from './mail.adapter.js';
import { NodemailerAdapter } from './adapters/nodemailer.adapter.js';
import { MailService } from './mail.service.js';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: MailAdapter,
      useClass: NodemailerAdapter,
    },
    MailService,
  ],
  exports: [MailService, MailAdapter],
})
export class MailModule {}
