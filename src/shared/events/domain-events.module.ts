import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { DomainEventsProcessor } from './domain-events.processor.js';
import { DomainEventsListener } from './domain-events.listener.js';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'domain-events',
    }),
  ],
  providers: [DomainEventsProcessor, DomainEventsListener],
  exports: [BullModule],
})
export class DomainEventsModule {}
