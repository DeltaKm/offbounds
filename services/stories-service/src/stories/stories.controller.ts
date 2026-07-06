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
import { StoriesService } from './stories.service';
import { CreateStoryDto } from './dto/create-story.dto';
import { CreateReactionDto } from './dto/reaction.dto';

@Controller('stories')
@UseGuards(JwtAuthGuard)
export class StoriesController {
  constructor(private readonly storiesService: StoriesService) {}

  @Post()
  create(@Request() req: { user: { sub: string } }, @Body() dto: CreateStoryDto) {
    return this.storiesService.create(req.user.sub, dto);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.storiesService.findById(id);
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.storiesService.findByUser(userId);
  }

  @Get('feed')
  findFeed(
    @Request() req: { user: { sub: string } },
    @Query('followingIds') followingIds?: string,
  ) {
    const ids = followingIds ? followingIds.split(',') : [];
    return this.storiesService.findFeed(req.user.sub, ids);
  }

  @Delete(':id')
  delete(@Request() req: { user: { sub: string } }, @Param('id') id: string) {
    return this.storiesService.delete(req.user.sub, id);
  }

  @Post(':id/view')
  view(@Request() req: { user: { sub: string } }, @Param('id') id: string) {
    return this.storiesService.view(req.user.sub, id);
  }

  @Get(':id/views')
  getViews(@Param('id') id: string) {
    return this.storiesService.getViews(id);
  }

  @Post(':id/react')
  react(
    @Request() req: { user: { sub: string } },
    @Param('id') id: string,
    @Body() dto: CreateReactionDto,
  ) {
    return this.storiesService.react(req.user.sub, id, dto);
  }

  @Get(':id/reactions')
  getReactions(@Param('id') id: string) {
    return this.storiesService.getReactions(id);
  }

  @Post('cleanup')
  cleanupExpired() {
    return this.storiesService.cleanupExpired();
  }
}
