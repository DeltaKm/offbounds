import { Injectable } from '@nestjs/common';
import { UsersRepository, UserWithAuth } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  createUser(payload: { email: string; username: string; phoneNumber: string; passwordHash: string; passwordSalt: string }) {
    return this.usersRepository.createUserWithAuth(payload);
  }

  findByEmail(email: string): Promise<UserWithAuth | null> {
    return this.usersRepository.findByEmail(email);
  }

  findByUsername(username: string): Promise<UserWithAuth | null> {
    return this.usersRepository.findByUsername(username);
  }

  findById(id: string): Promise<UserWithAuth | null> {
    return this.usersRepository.findById(id);
  }

  findAuthByUserId(userId: string) {
    return this.usersRepository.findAuthByUserId(userId);
  }

  findAuthById(userAuthId: string) {
    return this.usersRepository.findUserAuthById(userAuthId);
  }

  markEmailVerified(userAuthId: string) {
    return this.usersRepository.updateEmailVerification(userAuthId, true);
  }

  updatePassword(userAuthId: string, data: { passwordHash: string; passwordSalt: string }) {
    return this.usersRepository.updatePassword(userAuthId, data);
  }
}
