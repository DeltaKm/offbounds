import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ConfigService } from '../config/config.service';
import { NotificationService } from './notification.service';
import * as jwt from 'jsonwebtoken';
import { TokenPayload } from '@offbounds/shared-types';

@WebSocketGateway({
  namespace: 'notifications',
  cors: { origin: '*' },
})
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly userSockets = new Map<string, string>();

  constructor(
    private readonly config: ConfigService,
    private readonly notificationService: NotificationService,
  ) {}

  async handleConnection(client: Socket) {
    const token =
      (client.handshake.query.token as string) ||
      (client.handshake.headers.authorization as string)?.replace('Bearer ', '');

    if (!token) {
      client.disconnect(true);
      return;
    }

    try {
      const payload = jwt.verify(token, this.config.jwtAccessSecret) as TokenPayload;
      client.data.userId = payload.sub;
      this.userSockets.set(payload.sub, client.id);
      const unread = await this.notificationService.countUnread(payload.sub);
      client.emit('badge:count', unread);
    } catch {
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId as string;
    if (userId && this.userSockets.get(userId) === client.id) {
      this.userSockets.delete(userId);
    }
  }

  @SubscribeMessage('badge:refresh')
  async refreshBadge(client: Socket) {
    const userId = client.data.userId as string;
    if (!userId) return;
    const unread = await this.notificationService.countUnread(userId);
    client.emit('badge:count', unread);
  }

  notifyUser(userId: string, notification: unknown) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('notification:new', notification);
      this.refreshBadgeBySocketId(socketId);
    }
  }

  private async refreshBadgeBySocketId(socketId: string) {
    const sockets = await this.server.in(socketId).fetchSockets();
    for (const socket of sockets) {
      const userId = socket.data.userId as string;
      if (userId) {
        const unread = await this.notificationService.countUnread(userId);
        socket.emit('badge:count', unread);
      }
    }
  }
}
