import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('track')
  trackEvent(@Request() req: { user: { sub: string } }, @Body() data: {
    eventType: string;
    eventName: string;
    properties?: unknown;
    sessionId?: string;
    userAgent?: string;
    ipAddress?: string;
    referer?: string;
  }) {
    return this.analyticsService.trackEvent(req.user.sub, data);
  }

  @Get('events')
  getEvents(@Request() req: { user: { sub: string } }) {
    return this.analyticsService.getEventsByUser(req.user.sub);
  }

  @Get('events/type/:eventType')
  getEventsByType(@Param('eventType') eventType: string) {
    return this.analyticsService.getEventsByType(eventType);
  }

  @Post('session/start')
  startSession(@Body() data: {
    userId?: string;
    sessionId: string;
    deviceType?: string;
    browser?: string;
    os?: string;
    country?: string;
    city?: string;
  }) {
    return this.analyticsService.startSession(data);
  }

  @Post('session/end/:sessionId')
  endSession(@Param('sessionId') sessionId: string) {
    return this.analyticsService.endSession(sessionId);
  }

  @Get('session/:sessionId')
  getSession(@Param('sessionId') sessionId: string) {
    return this.analyticsService.getSession(sessionId);
  }

  @Get('sessions/user/:userId')
  getUserSessions(@Param('userId') userId: string) {
    return this.analyticsService.getUserSessions(userId);
  }
}
