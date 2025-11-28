import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class DatabaseReadyGuard implements CanActivate {
  constructor(private readonly databaseService: DatabaseService) {}

  canActivate(_context: ExecutionContext): boolean {
    if (this.databaseService.isDbReady()) {
      return true;
    }

    throw new HttpException(
      {
        error: 'DATABASE_UNAVAILABLE',
        message: 'Content service cannot access the database',
      },
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }
}
