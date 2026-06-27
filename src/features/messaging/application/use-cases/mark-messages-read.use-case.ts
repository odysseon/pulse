import { Injectable, ForbiddenException } from '@nestjs/common';
import { IConversationRepository } from '../../domain/ports/conversation.repository.port.js';
import { IRealtimeGateway } from '../../domain/ports/realtime.gateway.port.js';
import { MarkMessagesReadInput } from '../../domain/types/messaging.types.js';

@Injectable()
export class MarkMessagesReadUseCase {
  constructor(
    private readonly repo: IConversationRepository,
    private readonly realtime: IRealtimeGateway,
  ) {}

  async execute(input: MarkMessagesReadInput): Promise<void> {
    const allowed = await this.repo.isParticipant(input.conversationId, input.userId);
    if (!allowed) {
      throw new ForbiddenException('You are not a participant of this conversation.');
    }

    await this.repo.markRead(input);

    const readAt = new Date();
    for (const messageId of input.messageIds) {
      this.realtime.broadcastReadReceipt(input.conversationId, messageId, input.userId, readAt);
    }
  }
}
