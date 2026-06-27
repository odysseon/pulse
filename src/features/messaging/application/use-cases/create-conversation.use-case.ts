import { Injectable } from '@nestjs/common';
import { IConversationRepository } from '../../domain/ports/conversation.repository.port.js';
import { CreateConversationInput, ConversationView } from '../../domain/types/messaging.types.js';

@Injectable()
export class CreateConversationUseCase {
  constructor(private readonly repo: IConversationRepository) {}

  async execute(input: CreateConversationInput): Promise<ConversationView> {
    return this.repo.create(input);
  }
}
