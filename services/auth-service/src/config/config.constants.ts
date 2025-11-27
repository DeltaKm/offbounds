import type Redis from 'ioredis';

export const REDIS_CLIENT = 'REDIS_CLIENT';

export type RedisWithStatus = Redis & { isConnected: boolean };
