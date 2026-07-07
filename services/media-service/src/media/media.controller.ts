import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MediaService } from './media.service';
import { CreateMediaDto } from './dto/create-media.dto';

@Controller('media')
@UseGuards(JwtAuthGuard)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post()
  create(@Request() req: { user: { sub: string } }, @Body() dto: CreateMediaDto) {
    return this.mediaService.create(req.user.sub, dto);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.mediaService.findById(id);
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string, @Query('limit') limit?: string) {
    return this.mediaService.findByUser(userId, { limit: limit ? Number(limit) : 20 });
  }

  @Get('feed')
  findFeed(@Request() req: { user?: { sub: string } }, @Query('limit') limit?: string, @Query('before') before?: string) {
    return this.mediaService.findFeed(req.user?.sub, { limit: limit ? Number(limit) : 20, before });
  }

  @Get('shorts')
  findShortVideos(@Query('limit') limit?: string, @Query('before') before?: string) {
    return this.mediaService.findShortVideos({ limit: limit ? Number(limit) : 20, before });
  }

  @Post(':id/unlock')
  unlockMedia(@Request() req: { user: { sub: string } }, @Param('id') id: string) {
    return this.mediaService.unlockMedia(id, req.user.sub);
  }

  @Delete(':id')
  delete(@Request() req: { user: { sub: string } }, @Param('id') id: string) {
    return this.mediaService.delete(req.user.sub, id);
  }

  @Put(':id/metadata')
  updateMetadata(
    @Request() req: { user: { sub: string } },
    @Param('id') id: string,
    @Body() metadata: Record<string, unknown>,
  ) {
    return this.mediaService.updateMetadata(req.user.sub, id, metadata);
  }

  @Post(':id/share')
  generateShareLink(@Request() req: { user: { sub: string } }, @Param('id') id: string) {
    return this.mediaService.generateShareLink(req.user.sub, id);
  }
}
