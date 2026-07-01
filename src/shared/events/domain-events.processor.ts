import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

@Processor('domain-events')
export class DomainEventsProcessor extends WorkerHost {
  private readonly logger = new Logger(DomainEventsProcessor.name);

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing ${job.name} job ${job.id} for payload: ${JSON.stringify(job.data)}`);
    // Here we can eventually fanout to location-based email services, search indexers, etc.
    return { success: true };
  }
}
