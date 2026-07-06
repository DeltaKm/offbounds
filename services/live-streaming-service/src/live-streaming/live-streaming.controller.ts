import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LiveStreamingService } from './live-streaming.service';
import { CreateStreamDto } from './dto/create-stream.dto';

@Controller('live-streaming')
@UseGuards(JwtAuthGuard)
export class LiveStreamingController {
  constructor(private readonly liveStreamingService: LiveStreamingService) {}

  @Post()
  create(@Request() req: { user: { sub: string } }, @Body() dto: CreateStreamDto) {
    return this.liveStreamingService.create(req.user.sub, dto);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.liveStreamingService.findById(id);
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.liveStreamingService.findByUser(userId);
  }

  @Get('active')
  findActive() {
    return this.liveStreamingService.findActive();
  }

  @Post(':id/start')
  start(@Request() req: { user: { sub: string } }, @Param('id') id: string) {
    return this.liveStreamingService.start(req.user.sub, id);
  }

  @Post(':id/stop')
  stop(@Request() req: { user: { sub: string } }, @Param('id') id: string) {
    return this.liveStreamingService.stop(req.user.sub, id);
  }

  @Delete(':id')
  delete(@Request() req: { user: { sub: string } }, @Param('id') id: string) {
    return this.liveStreamingService.delete(req.user.sub, id);
  }

  @Post(':id/join')
  join(@Request() req: { user: { sub: string } }, @Param('id') id: string) {
    return this.liveStreamingService.join(req.user.sub, id);
  }

  @Post(':id/leave')
  leave(@Request() req: { user: { sub: string } }, @Param('id') id: string) {
    return this.liveStreamingService.leave(req.user.sub, id);
  }

  @Get(':id/viewers')
  getViewerCount(@Param('id') id: string) {
    return this.liveStreamingService.getViewerCount(id);
  }

  @Put(':id/viewers')
  updateViewerCount(@Param('id') id: string) {
    return this.liveStreamingService.updateViewerCount(id);
  }
}
