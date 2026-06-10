import { Injectable } from '@nestjs/common';
import { MailAdapter, SendMailOptions } from './mail.adapter.js';

@Injectable()
export class MailService {
  constructor(private readonly adapter: MailAdapter) {}

  async sendMail(options: SendMailOptions): Promise<void> {
    return this.adapter.sendMail(options);
  }
}
