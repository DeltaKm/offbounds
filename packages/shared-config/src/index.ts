import { config as loadDotenv } from 'dotenv';
import { findUpSync } from 'find-up';
import { z } from 'zod';

export const baseEnvSchema = z.object({
  DATABASE_URL: z.string().optional(),
  REDIS_URL: z.string().optional(),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(32),

  ACCESS_TOKEN_TTL: z.string().default("900"),
  REFRESH_TOKEN_TTL: z.string().default("604800"),
  EMAIL_TOKEN_TTL: z.string().default("600"),
  PASSWORD_RESET_TOKEN_TTL: z.string().default("600"),
});


type EnvSchema = {
  safeParse: typeof baseEnvSchema.safeParse;
};

const cachedValues = new Map<string, string>();
const loadedEnvFiles = new Set<string>();
let envFilesBootstrapped = false;

const bootstrapEnvFiles = () => {
  if (envFilesBootstrapped) {
    return;
  }

  const externallyDefinedKeys = new Map<string, string | undefined>();
  Object.keys(process.env).forEach((key) => {
    externallyDefinedKeys.set(key, process.env[key]);
  });

  const loadFile = (filename?: string, override = false) => {
    if (!filename) return;

    const filePath = findUpSync(filename);
    if (filePath && !loadedEnvFiles.has(filePath)) {
      loadDotenv({ path: filePath, override });
      loadedEnvFiles.add(filePath);
    }
  };

  // Load files
  loadFile('.env');
  if (process.env.NODE_ENV) loadFile(`.env.${process.env.NODE_ENV}`, true);
  loadFile('.env.local', true);

  externallyDefinedKeys.forEach((value, key) => {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  });

  envFilesBootstrapped = true;
};

export const loadEnv = (schema?: EnvSchema) => {
  bootstrapEnvFiles();

  if (schema) {
    const result = schema.safeParse(process.env);
    if (!result.success) {
      throw new Error(
        `Invalid environment configuration: ${JSON.stringify(result.error.issues, null, 2)}`
      );
    }

    const parsed = result.data as Record<string, unknown>;
    Object.entries(parsed).forEach(([key, value]) => {
      if (typeof value === 'string') cachedValues.set(key, value);
    });
  }
};

export const getEnv = (key: string, fallback?: string) => {
  if (cachedValues.has(key)) return cachedValues.get(key) as string;

  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing environment variable: ${key}`);
  }

  cachedValues.set(key, value);
  return value;
};
