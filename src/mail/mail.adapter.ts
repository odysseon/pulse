export interface SendMailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
}

export abstract class MailAdapter {
  abstract sendMail(options: SendMailOptions): Promise<void>;
}
