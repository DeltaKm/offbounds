import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import * as argon2 from 'argon2';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterUserDto } from './dto/register-user.dto';

@Injectable()
export class RegistrationService {
  constructor(private readonly prisma: PrismaService) {}

  async register(dto: RegisterUserDto) {
    const conflictField = await this.findExistingField(dto.email, dto.username);
    if (conflictField) {
      throw new ConflictException(`${conflictField} already in use`);
    }

    const { hash, salt } = await this.hashPassword(dto.password);

    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          username: dto.username,
          auth: {
            create: {
              passwordHash: hash,
              passwordSalt: salt,
            },
          },
        },
        include: { auth: true },
      });

      return {
        id: user.id,
        email: user.email,
        username: user.username,
        isEmailVerified: user.auth?.isEmailVerified ?? false,
        createdAt: user.createdAt,
      };
    } catch (error: unknown) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
        const target = Array.isArray(error.meta?.target) ? error.meta?.target[0] : 'field';
        throw new ConflictException(`${target} already in use`);
      }
      throw new InternalServerErrorException('Unable to create user');
    }
  }

  private async findExistingField(email: string, username: string) {
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: { equals: email, mode: 'insensitive' } }, { username: { equals: username } }],
      },
      select: { email: true, username: true },
    });

    if (!existing) return null;
    if (existing.email.toLowerCase() === email.toLowerCase()) {
      return 'email';
    }
    return 'username';
  }

  private async hashPassword(password: string) {
    const salt = randomBytes(16).toString('hex');
    const hash = await argon2.hash(password + salt);
    return { hash, salt };
  }
}
