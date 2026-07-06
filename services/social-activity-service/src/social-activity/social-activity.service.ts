import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LikeDto } from './dto/like.dto';
import { FollowDto } from './dto/follow.dto';
import { CreateCommentDto } from './dto/comment.dto';
import { Like, Follow, Comment } from '@prisma/client';

@Injectable()
export class SocialActivityService {
  constructor(private readonly prisma: PrismaService) {}

  async like(userId: string, dto: LikeDto): Promise<Like> {
    return this.prisma.like.create({
      data: {
        userId,
        targetType: dto.targetType,
        targetId: dto.targetId,
      },
    });
  }

  async unlike(userId: string, targetType: string, targetId: string): Promise<void> {
    const like = await this.prisma.like.findUnique({
      where: {
        userId_targetType_targetId: {
          userId,
          targetType,
          targetId,
        },
      },
    });
    if (!like) {
      throw new NotFoundException('Like not found');
    }
    await this.prisma.like.delete({
      where: {
        userId_targetType_targetId: {
          userId,
          targetType,
          targetId,
        },
      },
    });
  }

  async isLiked(userId: string, targetType: string, targetId: string): Promise<boolean> {
    const like = await this.prisma.like.findUnique({
      where: {
        userId_targetType_targetId: {
          userId,
          targetType,
          targetId,
        },
      },
    });
    return !!like;
  }

  async getLikes(targetType: string, targetId: string): Promise<Like[]> {
    return this.prisma.like.findMany({
      where: { targetType, targetId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async follow(userId: string, dto: FollowDto): Promise<Follow> {
    if (userId === dto.followingId) {
      throw new Error('Cannot follow yourself');
    }
    return this.prisma.follow.create({
      data: {
        followerId: userId,
        followingId: dto.followingId,
      },
    });
  }

  async unfollow(userId: string, followingId: string): Promise<void> {
    const follow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId,
        },
      },
    });
    if (!follow) {
      throw new NotFoundException('Follow not found');
    }
    await this.prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId,
        },
      },
    });
  }

  async isFollowing(userId: string, followingId: string): Promise<boolean> {
    const follow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId,
        },
      },
    });
    return !!follow;
  }

  async getFollowers(userId: string): Promise<Follow[]> {
    return this.prisma.follow.findMany({
      where: { followingId: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getFollowing(userId: string): Promise<Follow[]> {
    return this.prisma.follow.findMany({
      where: { followerId: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createComment(userId: string, dto: CreateCommentDto): Promise<Comment> {
    return this.prisma.comment.create({
      data: {
        userId,
        targetType: dto.targetType,
        targetId: dto.targetId,
        content: dto.content,
      },
    });
  }

  async updateComment(userId: string, commentId: string, content: string): Promise<Comment> {
    const comment = await this.prisma.comment.findFirst({
      where: { id: commentId, userId },
    });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    return this.prisma.comment.update({
      where: { id: commentId },
      data: { content },
    });
  }

  async deleteComment(userId: string, commentId: string): Promise<void> {
    const comment = await this.prisma.comment.findFirst({
      where: { id: commentId, userId },
    });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    await this.prisma.comment.delete({ where: { id: commentId } });
  }

  async getComments(targetType: string, targetId: string, limit = 20): Promise<Comment[]> {
    return this.prisma.comment.findMany({
      where: { targetType, targetId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
