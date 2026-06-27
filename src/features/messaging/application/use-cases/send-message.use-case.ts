import { Injectable, ForbiddenException } from '@nestjs/common';
import { IConversationRepository } from '../../domain/ports/conversation.repository.port.js';
import { IRealtimeGateway } from '../../domain/ports/realtime.gateway.port.js';
import { SendMessageInput, MessageView } from '../../domain/types/messaging.types.js';

@Injectable()
export class SendMessageUseCase {
  constructor(
    private readonly repo: IConversationRepository,
    private readonly realtime: IRealtimeGateway,
  ) {}

  async execute(input: SendMessageInput): Promise<MessageView> {
    const allowed = await this.repo.isParticipant(input.conversationId, input.senderId);
    if (!allowed) {
      throw new ForbiddenException('You are not a participant of this conversation.');
    }

    const message = await this.repo.addMessage(input);
    this.realtime.broadcastMessage(input.conversationId, message);
    return message;
  }
}
