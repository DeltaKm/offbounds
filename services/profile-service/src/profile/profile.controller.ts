import { Controller, Get, Post, Put, Delete, Body, Param, Query, Request } from '@nestjs/common';
import { ProfileService } from './profile.service';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Post()
  createProfile(@Request() req: { user: { sub: string } }, @Body() data: {
    displayName: string;
    bio?: string;
    avatarUrl?: string;
    bannerUrl?: string;
  }) {
    return this.profileService.createProfile(req.user.sub, data);
  }

  @Get()
  getProfile(@Request() req: { user: { sub: string } }) {
    return this.profileService.getProfile(req.user.sub);
  }

  @Put()
  updateProfile(@Request() req: { user: { sub: string } }, @Body() data: {
    displayName?: string;
    bio?: string;
    avatarUrl?: string;
    bannerUrl?: string;
    isVerified?: boolean;
  }) {
    return this.profileService.updateProfile(req.user.sub, data);
  }

  @Get(':userId/public-feed')
  getPublicFeed(
    @Param('userId') userId: string,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.profileService.getPublicFeed(userId, Number(limit) || 20, cursor);
  }

  @Get(':userId/premium-feed')
  getPremiumFeed(
    @Param('userId') userId: string,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.profileService.getPremiumFeed(userId, Number(limit) || 20, cursor);
  }

  @Get(':userId/gallery')
  getMediaGallery(
    @Param('userId') userId: string,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.profileService.getMediaGallery(userId, Number(limit) || 50, cursor);
  }

  @Post('media')
  addMedia(@Request() req: { user: { sub: string } }, @Body() data: {
    title?: string;
    description?: string;
    mediaUrl: string;
    mediaType: string;
    isPremium?: boolean;
    price?: number;
  }) {
    return this.profileService.addMedia(req.user.sub, data);
  }

  @Delete('media/:mediaId')
  deleteMedia(@Request() req: { user: { sub: string } }, @Param('mediaId') mediaId: string) {
    return this.profileService.deleteMedia(req.user.sub, mediaId);
  }
}
