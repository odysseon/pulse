import { MessageView } from '../types/messaging.types.js';

export abstract class IRealtimeGateway {
  abstract broadcastMessage(conversationId: string, message: MessageView): void;
  abstract broadcastReadReceipt(
    conversationId: string,
    messageId: string,
    userId: string,
    readAt: Date,
  ): void;
}
