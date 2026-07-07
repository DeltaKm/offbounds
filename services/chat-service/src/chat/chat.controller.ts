import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ChatService } from './chat.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { TokenPayload } from '@offbounds/shared-types';

interface AuthenticatedRequest extends Request {
  user: TokenPayload;
}

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('conversations')
  async createConversation(@Req() req: AuthenticatedRequest, @Body() dto: CreateConversationDto) {
    return this.chatService.createConversation(
      req.user.sub,
      dto.participantIds,
      dto.isGroup ?? false,
      dto.title,
    );
  }

  @Get('conversations')
  async listConversations(@Req() req: AuthenticatedRequest, @Query('categoryId') categoryId?: string) {
    return this.chatService.listConversations(req.user.sub, categoryId);
  }

  @Get('conversations/:id/messages')
  async getMessages(
    @Req() req: AuthenticatedRequest,
    @Param('id') conversationId: string,
    @Query('limit') limit?: string,
    @Query('before') before?: string,
  ) {
    return this.chatService.getMessages(conversationId, req.user.sub, Number(limit) || 50, before);
  }

  @Post('conversations/:id/messages')
  async sendMessage(
    @Req() req: AuthenticatedRequest,
    @Param('id') conversationId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.chatService.sendMessage(
      conversationId,
      req.user.sub,
      dto.content,
      dto.type,
      {
        mediaUrl: dto.mediaUrl,
        mediaThumbnail: dto.mediaThumbnail,
        price: dto.price,
        ttlSeconds: dto.ttlSeconds,
        scheduledFor: dto.scheduledFor ? new Date(dto.scheduledFor) : undefined,
      },
    );
  }

  @Post('messages/:id/unlock')
  async unlockPpvMessage(@Req() req: AuthenticatedRequest, @Param('id') messageId: string) {
    return this.chatService.unlockPpvMessage(messageId, req.user.sub);
  }

  @Post('conversations/:id/read')
  async markRead(@Req() req: AuthenticatedRequest, @Param('id') conversationId: string) {
    return this.chatService.markRead(conversationId, req.user.sub);
  }

  @Post('categories')
  async createCategory(
    @Req() req: AuthenticatedRequest,
    @Body() dto: { name: string; color?: string; icon?: string },
  ) {
    return this.chatService.createCategory(req.user.sub, dto.name, dto.color, dto.icon);
  }

  @Get('categories')
  async listCategories(@Req() req: AuthenticatedRequest) {
    return this.chatService.listCategories(req.user.sub);
  }

  @Patch('categories/:id')
  async updateCategory(
    @Req() req: AuthenticatedRequest,
    @Param('id') categoryId: string,
    @Body() dto: { name?: string; color?: string; icon?: string },
  ) {
    return this.chatService.updateCategory(categoryId, req.user.sub, dto);
  }

  @Delete('categories/:id')
  async deleteCategory(@Req() req: AuthenticatedRequest, @Param('id') categoryId: string) {
    return this.chatService.deleteCategory(categoryId, req.user.sub);
  }

  @Post('conversations/:id/category')
  async assignConversationToCategory(
    @Req() req: AuthenticatedRequest,
    @Param('id') conversationId: string,
    @Body() dto: { categoryId: string },
  ) {
    return this.chatService.assignConversationToCategory(conversationId, req.user.sub, dto.categoryId);
  }

  @Post('bulk-send')
  async sendBulkMessage(
    @Req() req: AuthenticatedRequest,
    @Body() dto: {
      recipientIds: string[];
      content: string;
      type?: string;
      mediaUrl?: string;
      mediaThumbnail?: string;
      price?: number;
      ttlSeconds?: number;
      scheduledFor?: string;
    },
  ) {
    return this.chatService.sendBulkMessage(
      req.user.sub,
      dto.recipientIds,
      dto.content,
      dto.type || 'text',
      {
        mediaUrl: dto.mediaUrl,
        mediaThumbnail: dto.mediaThumbnail,
        price: dto.price,
        ttlSeconds: dto.ttlSeconds,
        scheduledFor: dto.scheduledFor ? new Date(dto.scheduledFor) : undefined,
      },
    );
  }

  @Post('status')
  async setOnlineStatus(
    @Req() req: AuthenticatedRequest,
    @Body() dto: { status: 'online' | 'away' | 'offline' },
  ) {
    return this.chatService.setOnlineStatus(req.user.sub, dto.status);
  }

  @Get('status/:userId')
  async getOnlineStatus(@Param('userId') userId: string) {
    return this.chatService.getOnlineStatus(userId);
  }

  @Post('status/batch')
  async getOnlineStatuses(@Body() dto: { userIds: string[] }) {
    return this.chatService.getOnlineStatuses(dto.userIds);
  }

  @Post('conversations/:id/typing')
  async setTypingStatus(
    @Req() req: AuthenticatedRequest,
    @Param('id') conversationId: string,
    @Body() dto: { isTyping: boolean },
  ) {
    return this.chatService.setTypingStatus(conversationId, req.user.sub, dto.isTyping);
  }

  @Get('conversations/:id/typing')
  async getTypingUsers(@Req() req: AuthenticatedRequest, @Param('id') conversationId: string) {
    return this.chatService.getTypingUsers(conversationId, req.user.sub);
  }
}
