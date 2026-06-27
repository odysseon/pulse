import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { RedisModule } from '../../shared/redis/redis.module.js';
import { IConversationRepository } from './domain/ports/conversation.repository.port.js';
import { IRealtimeGateway } from './domain/ports/realtime.gateway.port.js';
import { PrismaConversationRepository } from './infrastructure/prisma-conversation.repository.js';
import { CreateConversationUseCase } from './application/use-cases/create-conversation.use-case.js';
import { SendMessageUseCase } from './application/use-cases/send-message.use-case.js';
import {
  GetConversationsByBusinessUseCase,
  GetConversationsByUserUseCase,
} from './application/use-cases/get-conversations.use-case.js';
import { GetConversationDetailsUseCase } from './application/use-cases/get-conversation-details.use-case.js';
import { UpdateConversationStatusUseCase } from './application/use-cases/update-conversation-status.use-case.js';
import { MarkMessagesReadUseCase } from './application/use-cases/mark-messages-read.use-case.js';
import { WsAuthGuard } from './api/gateways/ws-auth.guard.js';
import { MessagingGateway } from './api/gateways/messaging.gateway.js';
import { UserConversationsController } from './api/controllers/user-conversations.controller.js';
import { BusinessConversationsController } from './api/controllers/business-conversations.controller.js';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [UserConversationsController, BusinessConversationsController],
  providers: [
    // Repository binding
    {
      provide: IConversationRepository,
      useClass: PrismaConversationRepository,
    },
    // Gateway implements IRealtimeGateway — bind the class to the abstract token
    MessagingGateway,
    {
      provide: IRealtimeGateway,
      useExisting: MessagingGateway,
    },
    // Auth guard for WebSocket
    WsAuthGuard,
    // Use cases
    CreateConversationUseCase,
    SendMessageUseCase,
    GetConversationsByBusinessUseCase,
    GetConversationsByUserUseCase,
    GetConversationDetailsUseCase,
    UpdateConversationStatusUseCase,
    MarkMessagesReadUseCase,
  ],
  exports: [IConversationRepository],
})
export class MessagingModule {}
