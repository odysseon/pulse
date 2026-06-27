import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ConversationView,
  MessageView,
  MessageReadReceiptView,
} from '../../domain/types/messaging.types.js';

export class MessageReadReceiptResponseDto {
  @ApiProperty() messageId!: string;
  @ApiProperty() userId!: string;
  @ApiProperty() readAt!: Date;

  static from(r: MessageReadReceiptView): MessageReadReceiptResponseDto {
    const dto = new MessageReadReceiptResponseDto();
    dto.messageId = r.messageId;
    dto.userId = r.userId;
    dto.readAt = r.readAt;
    return dto;
  }
}

export class MessageResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() conversationId!: string;
  @ApiProperty() senderId!: string;
  @ApiProperty() content!: string;
  @ApiPropertyOptional() mediaUrl!: string | null;
  @ApiPropertyOptional() mediaType!: string | null;
  @ApiProperty() createdAt!: Date;
  @ApiProperty({ type: [MessageReadReceiptResponseDto] }) readReceipts!: MessageReadReceiptResponseDto[];

  static from(m: MessageView): MessageResponseDto {
    const dto = new MessageResponseDto();
    dto.id = m.id;
    dto.conversationId = m.conversationId;
    dto.senderId = m.senderId;
    dto.content = m.content;
    dto.mediaUrl = m.mediaUrl;
    dto.mediaType = m.mediaType;
    dto.createdAt = m.createdAt;
    dto.readReceipts = m.readReceipts.map(MessageReadReceiptResponseDto.from);
    return dto;
  }
}

export class ConversationResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() businessProfileId!: string;
  @ApiPropertyOptional() listingId!: string | null;
  @ApiPropertyOptional() subject!: string | null;
  @ApiProperty() status!: string;
  @ApiProperty({ type: [String] }) participantIds!: string[];
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
  @ApiPropertyOptional({ type: [MessageResponseDto] }) messages?: MessageResponseDto[];

  static from(c: ConversationView, messages?: MessageView[]): ConversationResponseDto {
    const dto = new ConversationResponseDto();
    dto.id = c.id;
    dto.businessProfileId = c.businessProfileId;
    dto.listingId = c.listingId;
    dto.subject = c.subject;
    dto.status = c.status;
    dto.participantIds = c.participantIds;
    dto.createdAt = c.createdAt;
    dto.updatedAt = c.updatedAt;
    if (messages) dto.messages = messages.map(MessageResponseDto.from);
    return dto;
  }
}
