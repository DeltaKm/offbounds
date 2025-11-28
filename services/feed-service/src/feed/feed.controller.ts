import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../common/guards/auth.guard';
import { DatabaseReadyGuard } from '../common/guards/database-ready.guard';
import { User, RequestUser } from '../common/decorators/user.decorator';
import { FeedService } from './feed.service';
import { CreateFeedDto } from './dto/create-feed.dto';
import { UpdateFeedDto } from './dto/update-feed.dto';

@Controller('feed')
@UseGuards(AuthGuard, DatabaseReadyGuard)
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Get()
  getFeed(@User() user: RequestUser) {
    return this.feedService.findAll(user.id);
  }

  @Get(':id')
  async getFeedById(@User() user: RequestUser, @Param('id') id: string) {
    const feed = await this.feedService.findOne(user.id, id);
    if (!feed) {
      throw new NotFoundException('Feed item not found');
    }
    return feed;
  }

  @Post()
  createFeed(@User() user: RequestUser, @Body() dto: CreateFeedDto) {
    return this.feedService.create(user.id, dto);
  }

  @Patch(':id')
  async updateFeed(
    @User() user: RequestUser,
    @Param('id') id: string,
    @Body() dto: UpdateFeedDto,
  ) {
    const updated = await this.feedService.update(user.id, id, dto);
    if (!updated) {
      throw new NotFoundException('Feed item not found');
    }
    return updated;
  }

  @Delete(':id')
  async deleteFeed(@User() user: RequestUser, @Param('id') id: string) {
    const deleted = await this.feedService.remove(user.id, id);
    if (!deleted) {
      throw new NotFoundException('Feed item not found');
    }
    return { success: true };
  }
}
