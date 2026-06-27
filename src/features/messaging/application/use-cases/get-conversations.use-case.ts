import { Injectable } from '@nestjs/common';
import { IConversationRepository } from '../../domain/ports/conversation.repository.port.js';
import { ConversationView } from '../../domain/types/messaging.types.js';

@Injectable()
export class GetConversationsByBusinessUseCase {
  constructor(private readonly repo: IConversationRepository) {}

  async execute(businessProfileId: string): Promise<ConversationView[]> {
    return this.repo.findByBusinessProfile(businessProfileId);
  }
}

@Injectable()
export class GetConversationsByUserUseCase {
  constructor(private readonly repo: IConversationRepository) {}

  async execute(userId: string): Promise<ConversationView[]> {
    return this.repo.findByParticipant(userId);
  }
}
