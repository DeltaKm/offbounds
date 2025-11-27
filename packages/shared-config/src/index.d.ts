import { z } from 'zod';
export declare const baseEnvSchema: z.ZodObject<{
    DATABASE_URL: z.ZodOptional<z.ZodString>;
    REDIS_URL: z.ZodOptional<z.ZodString>;
    JWT_ACCESS_SECRET: z.ZodString;
    JWT_REFRESH_SECRET: z.ZodString;
}, z.core.$strip>;
type EnvSchema = z.ZodTypeAny;
export declare const loadEnv: (schema?: EnvSchema) => void;
export declare const getEnv: (key: string, fallback?: string) => string;
export {};
