import { Injectable, NotFoundException } from '@nestjs/common';
import { IConversationRepository } from '../../domain/ports/conversation.repository.port.js';
import { ConversationStatus, ConversationView } from '../../domain/types/messaging.types.js';

@Injectable()
export class UpdateConversationStatusUseCase {
  constructor(private readonly repo: IConversationRepository) {}

  async execute(conversationId: string, status: ConversationStatus): Promise<ConversationView> {
    const exists = await this.repo.findById(conversationId);
    if (!exists) {
      throw new NotFoundException(`Conversation ${conversationId} not found.`);
    }
    return this.repo.updateStatus(conversationId, status);
  }
}
