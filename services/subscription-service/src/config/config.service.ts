import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class ConfigService {
  readonly databaseUrl: string;
  readonly jwtSecret: string;
  readonly port: number;

  constructor() {
    this.databaseUrl = process.env.DATABASE_URL || '';
    this.jwtSecret = process.env.JWT_SECRET || 'default-secret';
    this.port = parseInt(process.env.PORT || '3000', 10);
  }
}
