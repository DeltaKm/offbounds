import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AnalyticsEvent, UserSession } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async trackEvent(userId: string | null, data: {
    eventType: string;
    eventName: string;
    properties?: unknown;
    sessionId?: string;
    userAgent?: string;
    ipAddress?: string;
    referer?: string;
  }): Promise<AnalyticsEvent> {
    return this.prisma.analyticsEvent.create({
      data: {
        userId,
        eventType: data.eventType,
        eventName: data.eventName,
        properties: data.properties as never,
        sessionId: data.sessionId,
        userAgent: data.userAgent,
        ipAddress: data.ipAddress,
        referer: data.referer,
      },
    });
  }

  async getEventsByUser(userId: string, limit = 100): Promise<AnalyticsEvent[]> {
    return this.prisma.analyticsEvent.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  }

  async getEventsByType(eventType: string, limit = 100): Promise<AnalyticsEvent[]> {
    return this.prisma.analyticsEvent.findMany({
      where: { eventType },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  }

  async startSession(data: {
    userId?: string;
    sessionId: string;
    deviceType?: string;
    browser?: string;
    os?: string;
    country?: string;
    city?: string;
  }): Promise<UserSession> {
    return this.prisma.userSession.create({
      data,
    });
  }

  async endSession(sessionId: string): Promise<UserSession> {
    const session = await this.prisma.userSession.findUnique({
      where: { sessionId },
    });
    if (!session) {
      throw new Error('Session not found');
    }

    const duration = session.startedAt 
      ? Math.floor((Date.now() - session.startedAt.getTime()) / 1000)
      : null;

    return this.prisma.userSession.update({
      where: { sessionId },
      data: {
        endedAt: new Date(),
        duration,
      },
    });
  }

  async getSession(sessionId: string): Promise<UserSession | null> {
    return this.prisma.userSession.findUnique({
      where: { sessionId },
    });
  }

  async getUserSessions(userId: string): Promise<UserSession[]> {
    return this.prisma.userSession.findMany({
      where: { userId },
      orderBy: { startedAt: 'desc' },
    });
  }
}
