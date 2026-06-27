import { Injectable, NotFoundException } from '@nestjs/common';
import { IConversationRepository } from '../../domain/ports/conversation.repository.port.js';
import { ConversationView, MessageView } from '../../domain/types/messaging.types.js';

export interface ConversationDetails {
  conversation: ConversationView;
  messages: MessageView[];
}

@Injectable()
export class GetConversationDetailsUseCase {
  constructor(private readonly repo: IConversationRepository) {}

  async execute(conversationId: string): Promise<ConversationDetails> {
    const conversation = await this.repo.findById(conversationId);
    if (!conversation) {
      throw new NotFoundException(`Conversation ${conversationId} not found.`);
    }

    const messages = await this.repo.getMessages(conversationId);
    return { conversation, messages };
  }
}
