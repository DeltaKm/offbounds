import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
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
  async listConversations(@Req() req: AuthenticatedRequest) {
    return this.chatService.listConversations(req.user.sub);
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
    return this.chatService.sendMessage(conversationId, req.user.sub, dto.content, dto.type);
  }

  @Post('conversations/:id/read')
  async markRead(@Req() req: AuthenticatedRequest, @Param('id') conversationId: string) {
    return this.chatService.markRead(conversationId, req.user.sub);
  }
}
