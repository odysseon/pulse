import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { IConversationRepository } from '../domain/ports/conversation.repository.port.js';
import {
  ConversationView,
  MessageView,
  MessageReadReceiptView,
  CreateConversationInput,
  SendMessageInput,
  MarkMessagesReadInput,
  ConversationStatus,
} from '../domain/types/messaging.types.js';

@Injectable()
export class PrismaConversationRepository implements IConversationRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapMessage(m: {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    mediaUrl: string | null;
    mediaType: string | null;
    createdAt: Date;
    readReceipts: { messageId: string; userId: string; readAt: Date }[];
  }): MessageView {
    return {
      id: m.id,
      conversationId: m.conversationId,
      senderId: m.senderId,
      content: m.content,
      mediaUrl: m.mediaUrl,
      mediaType: m.mediaType as MessageView['mediaType'],
      createdAt: m.createdAt,
      readReceipts: m.readReceipts.map((r): MessageReadReceiptView => ({
        messageId: r.messageId,
        userId: r.userId,
        readAt: r.readAt,
      })),
    };
  }

  private mapConversation(c: {
    id: string;
    businessProfileId: string;
    listingId: string | null;
    subject: string | null;
    status: string;
    participants: { userId: string }[];
    createdAt: Date;
    updatedAt: Date;
  }): ConversationView {
    return {
      id: c.id,
      businessProfileId: c.businessProfileId,
      listingId: c.listingId,
      subject: c.subject,
      status: c.status as ConversationStatus,
      participantIds: c.participants.map((p) => p.userId),
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    };
  }

  async create(input: CreateConversationInput): Promise<ConversationView> {
    const conversation = await this.prisma.conversation.create({
      data: {
        businessProfileId: input.businessProfileId,
        listingId: input.listingId ?? null,
        subject: input.subject ?? null,
        participants: {
          create: { userId: input.userId },
        },
        messages: {
          create: {
            senderId: input.userId,
            content: input.initialMessage,
          },
        },
      },
      include: { participants: true },
    });

    return this.mapConversation(conversation);
  }

  async addMessage(input: SendMessageInput): Promise<MessageView> {
    const message = await this.prisma.message.create({
      data: {
        conversationId: input.conversationId,
        senderId: input.senderId,
        content: input.content,
        mediaUrl: input.mediaUrl ?? null,
        mediaType: input.mediaType ?? null,
      },
      include: { readReceipts: true },
    });

    await this.prisma.conversation.update({
      where: { id: input.conversationId },
      data: { updatedAt: new Date() },
    });

    return this.mapMessage(message);
  }

  async findById(id: string): Promise<ConversationView | null> {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id },
      include: { participants: true },
    });
    if (!conversation) return null;
    return this.mapConversation(conversation);
  }

  async findByBusinessProfile(businessProfileId: string): Promise<ConversationView[]> {
    const conversations = await this.prisma.conversation.findMany({
      where: { businessProfileId },
      include: { participants: true },
      orderBy: { updatedAt: 'desc' },
    });
    return conversations.map((c) => this.mapConversation(c));
  }

  async findByParticipant(userId: string): Promise<ConversationView[]> {
    const conversations = await this.prisma.conversation.findMany({
      where: { participants: { some: { userId } } },
      include: { participants: true },
      orderBy: { updatedAt: 'desc' },
    });
    return conversations.map((c) => this.mapConversation(c));
  }

  async getMessages(conversationId: string): Promise<MessageView[]> {
    const messages = await this.prisma.message.findMany({
      where: { conversationId },
      include: { readReceipts: true },
      orderBy: { createdAt: 'asc' },
    });
    return messages.map((m) => this.mapMessage(m));
  }

  async updateStatus(id: string, status: ConversationStatus): Promise<ConversationView> {
    const conversation = await this.prisma.conversation.update({
      where: { id },
      data: { status },
      include: { participants: true },
    });
    return this.mapConversation(conversation);
  }

  async markRead(input: MarkMessagesReadInput): Promise<void> {
    await this.prisma.$transaction(
      input.messageIds.map((messageId) =>
        this.prisma.messageReadReceipt.upsert({
          where: { messageId_userId: { messageId, userId: input.userId } },
          create: { messageId, userId: input.userId },
          update: {},
        }),
      ),
    );
  }

  async isParticipant(conversationId: string, userId: string): Promise<boolean> {
    const participant = await this.prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
    });
    return participant !== null;
  }
}
