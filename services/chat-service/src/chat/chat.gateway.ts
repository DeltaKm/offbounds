import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';
import { ChatService } from './chat.service';
import { ConfigService } from '../config/config.service';
import { TokenPayload } from '@offbounds/shared-types';

interface AuthenticatedSocket extends Socket {
  data: {
    userId?: string;
  };
}

@WebSocketGateway({
  namespace: '/chat',
  cors: { origin: '*' },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly chatService: ChatService,
    private readonly config: ConfigService,
  ) {}

  handleConnection(client: AuthenticatedSocket) {
    const token =
      (client.handshake.auth?.token as string | undefined) ||
      (client.handshake.query?.token as string | undefined);

    if (!token) {
      this.logger.warn(`Connection rejected (no token): ${client.id}`);
      client.disconnect();
      return;
    }

    try {
      const payload = jwt.verify(token, this.config.jwtAccessSecret) as TokenPayload;
      client.data.userId = payload.sub;
    } catch (error) {
      this.logger.warn(`Connection rejected (invalid token): ${client.id}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('conversation:join')
  async handleJoin(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string },
  ) {
    const userId = client.data.userId;
    if (!userId) return;

    await this.chatService.assertParticipant(data.conversationId, userId);
    client.join(this.roomName(data.conversationId));
  }

  @SubscribeMessage('conversation:leave')
  handleLeave(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string },
  ) {
    client.leave(this.roomName(data.conversationId));
  }

  @SubscribeMessage('message:send')
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string; content: string; type?: string },
  ) {
    const userId = client.data.userId;
    if (!userId) return;

    const message = await this.chatService.sendMessage(
      data.conversationId,
      userId,
      data.content,
      data.type,
    );

    this.server.to(this.roomName(data.conversationId)).emit('message:new', message);
    return message;
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string; isTyping: boolean },
  ) {
    const userId = client.data.userId;
    if (!userId) return;

    client.to(this.roomName(data.conversationId)).emit('typing', {
      userId,
      isTyping: data.isTyping,
    });
  }

  private roomName(conversationId: string) {
    return `conversation:${conversationId}`;
  }
}
