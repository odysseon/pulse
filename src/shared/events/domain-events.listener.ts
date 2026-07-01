import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class DomainEventsListener {
  private readonly logger = new Logger(DomainEventsListener.name);

  constructor(
    @InjectQueue('domain-events') private readonly eventsQueue: Queue,
  ) {}

  @OnEvent('business.*')
  async handleBusinessEvents(payload: any) {
    this.logger.debug(`Queueing business event`);
    await this.eventsQueue.add('business-event', payload);
  }

  @OnEvent('listing.*')
  async handleListingEvents(payload: any) {
    this.logger.debug(`Queueing listing event`);
    await this.eventsQueue.add('listing-event', payload);
  }

  @OnEvent('tour.*')
  async handleTourEvents(payload: any) {
    this.logger.debug(`Queueing tour event`);
    await this.eventsQueue.add('tour-event', payload);
  }
}
