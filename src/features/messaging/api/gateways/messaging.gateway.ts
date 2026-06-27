import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
  WsException,
} from '@nestjs/websockets';
import { UseGuards, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { WsAuthGuard } from './ws-auth.guard.js';
import { IConversationRepository } from '../../domain/ports/conversation.repository.port.js';
import { IRealtimeGateway } from '../../domain/ports/realtime.gateway.port.js';
import { SendMessageUseCase } from '../../application/use-cases/send-message.use-case.js';
import { MarkMessagesReadUseCase } from '../../application/use-cases/mark-messages-read.use-case.js';
import { PrismaService } from '../../../../prisma/prisma.service.js';
import {
  WsSendMessagePayload,
  WsJoinConversationPayload,
  WsMarkReadPayload,
  WsMessageNewEvent,
  WsReadReceiptEvent,
} from '../dto/ws-events.dto.js';
import { MessageView } from '../../domain/types/messaging.types.js';

@WebSocketGateway({ namespace: '/ws/messaging', cors: { origin: '*', credentials: true } })
export class MessagingGateway
  implements OnGatewayConnection, OnGatewayDisconnect, IRealtimeGateway
{
  @WebSocketServer() server!: Server;
  private readonly logger = new Logger(MessagingGateway.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly conversationRepo: IConversationRepository,
    private readonly sendMessageUseCase: SendMessageUseCase,
    private readonly markReadUseCase: MarkMessagesReadUseCase,
  ) {}

  // ─── Lifecycle ────────────────────────────────────────────────────────────

  async handleConnection(client: Socket): Promise<void> {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private async resolveUserId(accountId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({ where: { accountId } });
    if (!user) throw new WsException('User not found.');
    return user.id;
  }

  private roomFor(conversationId: string): string {
    return `conversation:${conversationId}`;
  }

  // ─── IRealtimeGateway implementation ──────────────────────────────────────

  broadcastMessage(conversationId: string, message: MessageView): void {
    const event: WsMessageNewEvent = { conversationId, message };
    this.server.to(this.roomFor(conversationId)).emit('message:new', event);
  }

  broadcastReadReceipt(conversationId: string, messageId: string, userId: string, readAt: Date): void {
    const event: WsReadReceiptEvent = { conversationId, messageId, userId, readAt };
    this.server.to(this.roomFor(conversationId)).emit('message:read', event);
  }

  // ─── Subscriptions ────────────────────────────────────────────────────────

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('conversation:join')
  async handleJoin(
    @MessageBody() payload: WsJoinConversationPayload,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const identity = client.data.identity as { accountId: string };
    const userId = await this.resolveUserId(identity.accountId);

    const isParticipant = await this.conversationRepo.isParticipant(payload.conversationId, userId);
    if (!isParticipant) {
      throw new WsException('You are not a participant of this conversation.');
    }

    await client.join(this.roomFor(payload.conversationId));
    this.logger.log(`${client.id} joined ${this.roomFor(payload.conversationId)}`);
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('message:send')
  async handleSendMessage(
    @MessageBody() payload: WsSendMessagePayload,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const identity = client.data.identity as { accountId: string };
    const senderId = await this.resolveUserId(identity.accountId);

    const input: any = {
      conversationId: payload.conversationId,
      senderId,
      content: payload.content,
    };
    if (payload.mediaUrl !== undefined) input.mediaUrl = payload.mediaUrl;
    if (payload.mediaType !== undefined) input.mediaType = payload.mediaType;

    const message = await this.sendMessageUseCase.execute(input);
    this.broadcastMessage(payload.conversationId, message);
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('message:read')
  async handleMarkRead(
    @MessageBody() payload: WsMarkReadPayload,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const identity = client.data.identity as { accountId: string };
    const userId = await this.resolveUserId(identity.accountId);

    await this.markReadUseCase.execute({
      conversationId: payload.conversationId,
      messageIds: payload.messageIds,
      userId,
    });
    
    const readAt = new Date();
    for (const messageId of payload.messageIds) {
      this.broadcastReadReceipt(payload.conversationId, messageId, userId, readAt);
    }
  }
}
