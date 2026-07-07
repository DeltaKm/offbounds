import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '../config/config.service';
export declare class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private config;
    isConnected: boolean;
    constructor(config: ConfigService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
}
