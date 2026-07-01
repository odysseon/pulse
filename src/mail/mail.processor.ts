import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { isError } from '../shared/utils/error.util.js';
import { MailService } from './mail.service.js';
import { SendMailOptions } from './mail.adapter.js';

@Processor('mail')
export class MailProcessor extends WorkerHost {
  private readonly logger = new Logger(MailProcessor.name);

  constructor(private readonly mailService: MailService) {
    super();
  }

  async process(job: Job<SendMailOptions>): Promise<void> {
    const toStr = Array.isArray(job.data.to) ? job.data.to.join(', ') : job.data.to;
    this.logger.debug(`Processing mail job ${job.id ?? ''} for ${toStr}`);
    try {
      await this.mailService.sendMail(job.data);
      this.logger.debug(`Mail job ${job.id} completed successfully.`);
    } catch (error) {
      this.logger.error(
        `Failed to process mail job ${job.id}`,
        isError(error) ? error.stack : String(error),
      );
      throw error;
    }
  }
}
