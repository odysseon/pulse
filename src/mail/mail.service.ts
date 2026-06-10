import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { AppConfig } from '../configs/validation.js';

export interface SendMailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;
  private readonly from: string;

  constructor(private readonly configService: ConfigService<AppConfig>) {
    const host = this.configService.get('SMTP_HOST');
    const port = this.configService.get('SMTP_PORT');
    const user = this.configService.get('SMTP_USER');
    const pass = this.configService.get('SMTP_PASS');
    this.from = this.configService.get('SMTP_FROM') || 'noreply@example.com';

    if (host && port) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        auth: user && pass ? { user, pass } : undefined,
      });
      this.logger.log(`Mail service initialized with host ${host}:${port}`);
    } else {
      this.logger.warn('SMTP configuration is missing. Emails will be logged instead of sent.');
      this.transporter = nodemailer.createTransport({
        streamTransport: true,
        newline: 'unix',
        buffer: true,
      });
    }
  }

  async sendMail(options: SendMailOptions): Promise<void> {
    try {
      const info = await this.transporter.sendMail({
        from: this.from,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });

      if (info.message && Buffer.isBuffer(info.message)) {
        this.logger.debug(`[Mock Email] To: ${options.to} | Subject: ${options.subject}`);
        this.logger.debug(info.message.toString());
      } else {
        this.logger.log(`Email sent successfully to ${options.to} (MessageId: ${info.messageId})`);
      }
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}`, error instanceof Error ? error.stack : String(error));
      throw error;
    }
  }
}
