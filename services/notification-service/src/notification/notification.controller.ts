import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationService } from './notification.service';

@Controller('notification')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  create(@Body() dto: CreateNotificationDto) {
    return this.notificationService.create(dto);
  }

  @Get()
  findByUser(
    @Request() req: { user: { sub: string } },
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.notificationService.findByUser(
      req.user.sub,
      limit ? Number(limit) : 20,
      cursor,
    );
  }

  @Get('badge')
  badge(@Request() req: { user: { sub: string } }) {
    return this.notificationService.countUnread(req.user.sub);
  }

  @Post(':id/read')
  markAsRead(@Request() req: { user: { sub: string } }, @Param('id') id: string) {
    return this.notificationService.markAsRead(req.user.sub, id);
  }

  @Post('read-all')
  markAllAsRead(@Request() req: { user: { sub: string } }) {
    return this.notificationService.markAllAsRead(req.user.sub);
  }

  @Delete(':id')
  delete(@Request() req: { user: { sub: string } }, @Param('id') id: string) {
    return this.notificationService.delete(req.user.sub, id);
  }
}
