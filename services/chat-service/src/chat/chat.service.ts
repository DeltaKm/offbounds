import { ForbiddenException, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WalletService } from '@offbounds/wallet-service';

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly walletService: WalletService,
  ) {}

  async createConversation(
    creatorId: string,
    participantIds: string[],
    isGroup = false,
    title?: string,
  ) {
    const allParticipantIds = Array.from(new Set([creatorId, ...participantIds]));

    if (!isGroup && allParticipantIds.length === 2) {
      const existing = await this.prisma.conversation.findFirst({
        where: {
          isGroup: false,
          participants: {
            every: { userId: { in: allParticipantIds } },
          },
          AND: allParticipantIds.map((userId) => ({
            participants: { some: { userId } },
          })),
        },
        include: { participants: true },
      });

      if (existing) {
        return existing;
      }
    }

    return this.prisma.conversation.create({
      data: {
        isGroup,
        title,
        participants: {
          create: allParticipantIds.map((userId) => ({ userId })),
        },
      },
      include: { participants: true },
    });
  }

  async listConversations(userId: string, categoryId?: string) {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId,
            ...(categoryId ? { categoryId } : {}),
          },
        },
      },
      include: {
        participants: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return conversations;
  }

  async assertParticipant(conversationId: string, userId: string) {
    const participant = await this.prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
    });

    if (!participant) {
      throw new ForbiddenException('Not a participant of this conversation');
    }

    return participant;
  }

  async getMessages(conversationId: string, userId: string, limit = 50, before?: string) {
    await this.assertParticipant(conversationId, userId);

    const messages = await this.prisma.message.findMany({
      where: {
        conversationId,
        scheduledFor: { lte: new Date() },
        ...(before ? { createdAt: { lt: new Date(before) } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return messages.reverse();
  }

  async sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
    type = 'text',
    options?: {
      mediaUrl?: string;
      mediaThumbnail?: string;
      price?: number;
      ttlSeconds?: number;
      scheduledFor?: Date;
    },
  ) {
    await this.assertParticipant(conversationId, senderId);

    const now = new Date();
    const scheduledFor = options?.scheduledFor;

    if (scheduledFor && scheduledFor > now) {
      return this.prisma.message.create({
        data: {
          conversationId,
          senderId,
          content,
          type,
          mediaUrl: options?.mediaUrl,
          mediaThumbnail: options?.mediaThumbnail,
          price: options?.price,
          isPpv: !!options?.price,
          ttlSeconds: options?.ttlSeconds,
          expiresAt: options?.ttlSeconds ? new Date(now.getTime() + options.ttlSeconds * 1000) : null,
          scheduledFor,
        },
      });
    }

    const message = await this.prisma.message.create({
      data: {
        conversationId,
        senderId,
        content,
        type,
        mediaUrl: options?.mediaUrl,
        mediaThumbnail: options?.mediaThumbnail,
        price: options?.price,
        isPpv: !!options?.price,
        ttlSeconds: options?.ttlSeconds,
        expiresAt: options?.ttlSeconds ? new Date(now.getTime() + options.ttlSeconds * 1000) : null,
      },
    });

    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return message;
  }

  async unlockPpvMessage(messageId: string, userId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
      include: { conversation: { include: { participants: true } } },
    });

    if (!message || !message.isPpv) {
      throw new NotFoundException('Message not found or not PPV');
    }

    const isParticipant = message.conversation.participants.some((p) => p.userId === userId);
    if (!isParticipant) {
      throw new ForbiddenException('Not a participant');
    }

    if (message.senderId === userId) {
      return message;
    }

    if (message.isUnlocked) {
      return message;
    }

    if (!message.price) {
      throw new BadRequestException('Message has no price');
    }

    try {
      await this.walletService.withdraw(userId, 'STARS', message.price);
    } catch (error) {
      throw new BadRequestException('Insufficient stars to unlock message');
    }

    await this.walletService.addCreatorEarnings(message.senderId, message.price);

    return this.prisma.message.update({
      where: { id: messageId },
      data: { isUnlocked: true },
    });
  }

  async markRead(conversationId: string, userId: string) {
    await this.assertParticipant(conversationId, userId);

    return this.prisma.conversationParticipant.update({
      where: { conversationId_userId: { conversationId, userId } },
      data: { lastReadAt: new Date() },
    });
  }

  async getConversationOrThrow(conversationId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { participants: true },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return conversation;
  }

  async createCategory(userId: string, name: string, color?: string, icon?: string) {
    const maxOrder = await this.prisma.chatCategory.findFirst({
      where: { userId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    return this.prisma.chatCategory.create({
      data: {
        userId,
        name,
        color,
        icon,
        order: (maxOrder?.order ?? 0) + 1,
      },
    });
  }

  async listCategories(userId: string) {
    return this.prisma.chatCategory.findMany({
      where: { userId },
      orderBy: { order: 'asc' },
    });
  }

  async updateCategory(categoryId: string, userId: string, data: { name?: string; color?: string; icon?: string }) {
    const category = await this.prisma.chatCategory.findUnique({ where: { id: categoryId } });
    if (!category || category.userId !== userId) {
      throw new ForbiddenException('Category not found or not owned');
    }

    return this.prisma.chatCategory.update({
      where: { id: categoryId },
      data,
    });
  }

  async deleteCategory(categoryId: string, userId: string) {
    const category = await this.prisma.chatCategory.findUnique({ where: { id: categoryId } });
    if (!category || category.userId !== userId) {
      throw new ForbiddenException('Category not found or not owned');
    }

    await this.prisma.conversationParticipant.updateMany({
      where: { categoryId },
      data: { categoryId: null },
    });

    return this.prisma.chatCategory.delete({ where: { id: categoryId } });
  }

  async assignConversationToCategory(conversationId: string, userId: string, categoryId: string) {
    await this.assertParticipant(conversationId, userId);

    const category = await this.prisma.chatCategory.findUnique({ where: { id: categoryId } });
    if (!category || category.userId !== userId) {
      throw new ForbiddenException('Category not found or not owned');
    }

    return this.prisma.conversationParticipant.update({
      where: { conversationId_userId: { conversationId, userId } },
      data: { categoryId },
    });
  }

  async sendBulkMessage(
    senderId: string,
    recipientIds: string[],
    content: string,
    type = 'text',
    options?: {
      mediaUrl?: string;
      mediaThumbnail?: string;
      price?: number;
      ttlSeconds?: number;
      scheduledFor?: Date;
    },
  ) {
    const results = [];

    for (const recipientId of recipientIds) {
      try {
        const conversation = await this.createConversation(senderId, [recipientId], false);
        const message = await this.sendMessage(
          conversation.id,
          senderId,
          content,
          type,
          options,
        );
        results.push({ success: true, recipientId, messageId: message.id });
      } catch (error) {
        results.push({ success: false, recipientId, error: (error as Error).message });
      }
    }

    return results;
  }

  async setOnlineStatus(userId: string, status: 'online' | 'away' | 'offline') {
    return this.prisma.onlineStatus.upsert({
      where: { userId },
      update: { status, lastSeen: new Date() },
      create: { userId, status, lastSeen: new Date() },
    });
  }

  async getOnlineStatus(userId: string) {
    const status = await this.prisma.onlineStatus.findUnique({
      where: { userId },
    });
    return status || { userId, status: 'offline', lastSeen: new Date() };
  }

  async getOnlineStatuses(userIds: string[]) {
    return this.prisma.onlineStatus.findMany({
      where: { userId: { in: userIds } },
    });
  }

  async setTypingStatus(conversationId: string, userId: string, isTyping: boolean) {
    await this.assertParticipant(conversationId, userId);

    return this.prisma.typingIndicator.upsert({
      where: { conversationId_userId: { conversationId, userId } },
      update: { isTyping, updatedAt: new Date() },
      create: { conversationId, userId, isTyping },
    });
  }

  async getTypingUsers(conversationId: string, userId: string) {
    await this.assertParticipant(conversationId, userId);

    const typing = await this.prisma.typingIndicator.findMany({
      where: { conversationId, isTyping: true },
      select: { userId: true, updatedAt: true },
    });

    const tenSecondsAgo = new Date(Date.now() - 10000);
    return typing.filter((t) => t.updatedAt > tenSecondsAgo).map((t) => t.userId);
  }
}
