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
import { SocialActivityService } from './social-activity.service';
import { LikeDto } from './dto/like.dto';
import { FollowDto } from './dto/follow.dto';
import { CreateCommentDto } from './dto/comment.dto';

@Controller('social-activity')
@UseGuards(JwtAuthGuard)
export class SocialActivityController {
  constructor(private readonly socialActivityService: SocialActivityService) {}

  @Post('like')
  like(@Request() req: { user: { sub: string } }, @Body() dto: LikeDto) {
    return this.socialActivityService.like(req.user.sub, dto);
  }

  @Delete('like')
  unlike(
    @Request() req: { user: { sub: string } },
    @Query('targetType') targetType: string,
    @Query('targetId') targetId: string,
  ) {
    return this.socialActivityService.unlike(req.user.sub, targetType, targetId);
  }

  @Get('like/check')
  isLiked(
    @Request() req: { user: { sub: string } },
    @Query('targetType') targetType: string,
    @Query('targetId') targetId: string,
  ) {
    return this.socialActivityService.isLiked(req.user.sub, targetType, targetId);
  }

  @Get('likes')
  getLikes(@Query('targetType') targetType: string, @Query('targetId') targetId: string) {
    return this.socialActivityService.getLikes(targetType, targetId);
  }

  @Post('follow')
  follow(@Request() req: { user: { sub: string } }, @Body() dto: FollowDto) {
    return this.socialActivityService.follow(req.user.sub, dto);
  }

  @Delete('follow/:followingId')
  unfollow(@Request() req: { user: { sub: string } }, @Param('followingId') followingId: string) {
    return this.socialActivityService.unfollow(req.user.sub, followingId);
  }

  @Get('follow/check/:followingId')
  isFollowing(@Request() req: { user: { sub: string } }, @Param('followingId') followingId: string) {
    return this.socialActivityService.isFollowing(req.user.sub, followingId);
  }

  @Get('followers/:userId')
  getFollowers(@Param('userId') userId: string) {
    return this.socialActivityService.getFollowers(userId);
  }

  @Get('following/:userId')
  getFollowing(@Param('userId') userId: string) {
    return this.socialActivityService.getFollowing(userId);
  }

  @Post('comment')
  createComment(@Request() req: { user: { sub: string } }, @Body() dto: CreateCommentDto) {
    return this.socialActivityService.createComment(req.user.sub, dto);
  }

  @Put('comment/:id')
  updateComment(
    @Request() req: { user: { sub: string } },
    @Param('id') id: string,
    @Body('content') content: string,
  ) {
    return this.socialActivityService.updateComment(req.user.sub, id, content);
  }

  @Delete('comment/:id')
  deleteComment(@Request() req: { user: { sub: string } }, @Param('id') id: string) {
    return this.socialActivityService.deleteComment(req.user.sub, id);
  }

  @Get('comments')
  getComments(
    @Query('targetType') targetType: string,
    @Query('targetId') targetId: string,
    @Query('limit') limit?: string,
  ) {
    return this.socialActivityService.getComments(targetType, targetId, limit ? Number(limit) : 20);
  }

  @Post('gift')
  sendGift(
    @Request() req: { user: { sub: string } },
    @Body() dto: { recipientId: string; targetType: string; targetId: string; amount: number; message?: string },
  ) {
    return this.socialActivityService.sendGift(
      req.user.sub,
      dto.recipientId,
      dto.targetType,
      dto.targetId,
      dto.amount,
      dto.message,
    );
  }

  @Get('gifts/received')
  getGiftsReceived(@Request() req: { user: { sub: string } }, @Query('limit') limit?: string) {
    return this.socialActivityService.getGiftsReceived(req.user.sub, limit ? Number(limit) : 20);
  }

  @Get('gifts/sent')
  getGiftsSent(@Request() req: { user: { sub: string } }, @Query('limit') limit?: string) {
    return this.socialActivityService.getGiftsSent(req.user.sub, limit ? Number(limit) : 20);
  }
}
