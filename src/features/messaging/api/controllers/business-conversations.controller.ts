import { Controller, Post, Get, Put, Param, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CurrentIdentity, type RequestIdentity } from '@odysseon/whoami-adapter-nestjs';
import { PrismaService } from '../../../../prisma/prisma.service.js';
import { SendMessageUseCase } from '../../application/use-cases/send-message.use-case.js';
import { GetConversationsByBusinessUseCase } from '../../application/use-cases/get-conversations.use-case.js';
import { GetConversationDetailsUseCase } from '../../application/use-cases/get-conversation-details.use-case.js';
import { UpdateConversationStatusUseCase } from '../../application/use-cases/update-conversation-status.use-case.js';
import { IRealtimeGateway } from '../../domain/ports/realtime.gateway.port.js';
import { SendMessageDto, UpdateConversationStatusDto } from '../dto/request.dto.js';
import { ConversationResponseDto, MessageResponseDto } from '../dto/response.dto.js';

@ApiTags('Conversations (Business)')
@ApiBearerAuth()
@Controller('businesses/:businessId/conversations')
export class BusinessConversationsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sendMessage: SendMessageUseCase,
    private readonly getConversations: GetConversationsByBusinessUseCase,
    private readonly getDetails: GetConversationDetailsUseCase,
    private readonly updateStatus: UpdateConversationStatusUseCase,
    private readonly realtime: IRealtimeGateway,
  ) {}

  private async resolveUserId(accountId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({ where: { accountId } });
    if (!user) throw new Error('User not found');
    return user.id;
  }

  @Get()
  @ApiOperation({ summary: 'List all conversations for a business' })
  async list(@Param('businessId') businessId: string): Promise<ConversationResponseDto[]> {
    const conversations = await this.getConversations.execute(businessId);
    return conversations.map((c) => ConversationResponseDto.from(c));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get conversation details with messages' })
  async getOne(@Param('id') id: string): Promise<ConversationResponseDto> {
    const { conversation, messages } = await this.getDetails.execute(id);
    return ConversationResponseDto.from(conversation, messages);
  }

  @Post(':id/messages')
  @ApiOperation({ summary: 'Reply to a conversation (REST fallback)' })
  async reply(
    @CurrentIdentity() identity: RequestIdentity,
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
  ): Promise<MessageResponseDto> {
    const senderId = await this.resolveUserId(identity.accountId);
    const message = await this.sendMessage.execute({ conversationId: id, senderId, ...dto });
    this.realtime.broadcastMessage(id, message);
    return MessageResponseDto.from(message);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Close or reactivate a conversation' })
  async changeStatus(
    @Param('id') id: string,
    @Body() dto: UpdateConversationStatusDto,
  ): Promise<ConversationResponseDto> {
    const conversation = await this.updateStatus.execute(id, dto.status);
    return ConversationResponseDto.from(conversation);
  }
}
