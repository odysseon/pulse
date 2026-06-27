import {
  ConversationView,
  MessageView,
  CreateConversationInput,
  SendMessageInput,
  MarkMessagesReadInput,
  ConversationStatus,
} from '../types/messaging.types.js';

export abstract class IConversationRepository {
  abstract create(input: CreateConversationInput): Promise<ConversationView>;
  abstract addMessage(input: SendMessageInput): Promise<MessageView>;
  abstract findById(id: string): Promise<ConversationView | null>;
  abstract findByBusinessProfile(businessProfileId: string): Promise<ConversationView[]>;
  abstract findByParticipant(userId: string): Promise<ConversationView[]>;
  abstract getMessages(conversationId: string): Promise<MessageView[]>;
  abstract updateStatus(id: string, status: ConversationStatus): Promise<ConversationView>;
  abstract markRead(input: MarkMessagesReadInput): Promise<void>;
  abstract isParticipant(conversationId: string, userId: string): Promise<boolean>;
}
