export type ConversationStatus = 'ACTIVE' | 'CLOSED';
export type MessageMediaType = 'IMAGE' | 'VIDEO';

export interface ConversationView {
  id: string;
  businessProfileId: string;
  listingId: string | null;
  subject: string | null;
  status: ConversationStatus;
  participantIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MessageView {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  mediaUrl: string | null;
  mediaType: MessageMediaType | null;
  createdAt: Date;
  readReceipts: MessageReadReceiptView[];
}

export interface MessageReadReceiptView {
  messageId: string;
  userId: string;
  readAt: Date;
}

export interface CreateConversationInput {
  businessProfileId: string;
  userId: string;
  listingId?: string;
  subject?: string;
  initialMessage: string;
}

export interface SendMessageInput {
  conversationId: string;
  senderId: string;
  content: string;
  mediaUrl?: string;
  mediaType?: MessageMediaType;
}

export interface MarkMessagesReadInput {
  conversationId: string;
  messageIds: string[];
  userId: string;
}
