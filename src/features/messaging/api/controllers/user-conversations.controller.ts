import { Controller, Post, Get, Param, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CurrentIdentity, type RequestIdentity } from '@odysseon/whoami-adapter-nestjs';
import { PrismaService } from '../../../../prisma/prisma.service.js';
import { CreateConversationUseCase } from '../../application/use-cases/create-conversation.use-case.js';
import { SendMessageUseCase } from '../../application/use-cases/send-message.use-case.js';
import { GetConversationsByUserUseCase } from '../../application/use-cases/get-conversations.use-case.js';
import { GetConversationDetailsUseCase } from '../../application/use-cases/get-conversation-details.use-case.js';
import { MarkMessagesReadUseCase } from '../../application/use-cases/mark-messages-read.use-case.js';
import { IRealtimeGateway } from '../../domain/ports/realtime.gateway.port.js';
import {
  CreateConversationDto,
  SendMessageDto,
  MarkMessagesReadDto,
} from '../dto/request.dto.js';
import { ConversationResponseDto, MessageResponseDto } from '../dto/response.dto.js';

@ApiTags('Conversations (User)')
@ApiBearerAuth()
@Controller('users/me/conversations')
export class UserConversationsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly createConversation: CreateConversationUseCase,
    private readonly sendMessage: SendMessageUseCase,
    private readonly getConversations: GetConversationsByUserUseCase,
    private readonly getDetails: GetConversationDetailsUseCase,
    private readonly markRead: MarkMessagesReadUseCase,
    private readonly realtime: IRealtimeGateway,
  ) {}

  private async resolveUserId(accountId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({ where: { accountId } });
    if (!user) throw new Error('User not found');
    return user.id;
  }

  @Post()
  @ApiOperation({ summary: 'Start a new conversation with a business' })
  async create(
    @CurrentIdentity() identity: RequestIdentity,
    @Body() dto: CreateConversationDto,
  ): Promise<ConversationResponseDto> {
    const userId = await this.resolveUserId(identity.accountId);
    const conversation = await this.createConversation.execute({ ...dto, userId });
    return ConversationResponseDto.from(conversation);
  }

  @Get()
  @ApiOperation({ summary: 'List my conversations' })
  async list(
    @CurrentIdentity() identity: RequestIdentity,
  ): Promise<ConversationResponseDto[]> {
    const userId = await this.resolveUserId(identity.accountId);
    const conversations = await this.getConversations.execute(userId);
    return conversations.map((c) => ConversationResponseDto.from(c));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get conversation details with messages' })
  async getOne(@Param('id') id: string): Promise<ConversationResponseDto> {
    const { conversation, messages } = await this.getDetails.execute(id);
    return ConversationResponseDto.from(conversation, messages);
  }

  @Post(':id/messages')
  @ApiOperation({ summary: 'Send a message (REST fallback)' })
  async send(
    @CurrentIdentity() identity: RequestIdentity,
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
  ): Promise<MessageResponseDto> {
    const senderId = await this.resolveUserId(identity.accountId);
    const message = await this.sendMessage.execute({ conversationId: id, senderId, ...dto });
    this.realtime.broadcastMessage(id, message);
    return MessageResponseDto.from(message);
  }

  @Post(':id/messages/read')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Mark messages as read' })
  async read(
    @CurrentIdentity() identity: RequestIdentity,
    @Param('id') id: string,
    @Body() dto: MarkMessagesReadDto,
  ): Promise<void> {
    const userId = await this.resolveUserId(identity.accountId);
    await this.markRead.execute({ conversationId: id, messageIds: dto.messageIds, userId });
    
    const readAt = new Date();
    for (const messageId of dto.messageIds) {
      this.realtime.broadcastReadReceipt(id, messageId, userId, readAt);
    }
  }
}
