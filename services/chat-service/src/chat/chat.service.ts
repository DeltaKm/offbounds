import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

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

  async listConversations(userId: string) {
    const conversations = await this.prisma.conversation.findMany({
      where: { participants: { some: { userId } } },
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
        ...(before ? { createdAt: { lt: new Date(before) } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return messages.reverse();
  }

  async sendMessage(conversationId: string, senderId: string, content: string, type = 'text') {
    await this.assertParticipant(conversationId, senderId);

    const message = await this.prisma.message.create({
      data: {
        conversationId,
        senderId,
        content,
        type,
      },
    });

    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return message;
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
}
