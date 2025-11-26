import { Injectable } from '@nestjs/common';
import type { Prisma, User, UserAuth } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export type UserWithAuth = User & { auth: UserAuth | null };

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createUserWithAuth(data: {
    email: string;
    username: string;
    passwordHash: string;
    passwordSalt: string;
  }): Promise<UserWithAuth> {
    return this.prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        auth: {
          create: {
            passwordHash: data.passwordHash,
            passwordSalt: data.passwordSalt,
          },
        },
      },
      include: { auth: true },
    });
  }

  async findByEmail(email: string): Promise<UserWithAuth | null> {
    return this.prisma.user.findUnique({ where: { email }, include: { auth: true } });
  }

  async findByUsername(username: string): Promise<UserWithAuth | null> {
    return this.prisma.user.findUnique({ where: { username }, include: { auth: true } });
  }

  async findById(id: string): Promise<UserWithAuth | null> {
    return this.prisma.user.findUnique({ where: { id }, include: { auth: true } });
  }

  async findAuthByUserId(userId: string): Promise<UserAuth | null> {
    return this.prisma.userAuth.findUnique({ where: { userId } });
  }

  async findAuthById(userAuthId: string): Promise<UserAuth | null> {
    return this.prisma.userAuth.findUnique({ where: { id: userAuthId } });
  }

  async findUserAuthById(userAuthId: string): Promise<UserAuth & { user: User }> {
    return this.prisma.userAuth.findUniqueOrThrow({
      where: { id: userAuthId },
      include: { user: true },
    });
  }

  async updateEmailVerification(userAuthId: string, isVerified: boolean) {
    return this.prisma.userAuth.update({
      where: { id: userAuthId },
      data: { isEmailVerified: isVerified },
    });
  }

  async updatePassword(userAuthId: string, data: { passwordHash: string; passwordSalt: string }) {
    return this.prisma.userAuth.update({
      where: { id: userAuthId },
      data,
    });
  }

  async createRefreshToken(data: Prisma.RefreshTokenCreateInput) {
    return this.prisma.refreshToken.create({ data });
  }

  async updateRefreshToken(id: string, data: Prisma.RefreshTokenUpdateInput) {
    return this.prisma.refreshToken.update({ where: { id }, data });
  }
}
