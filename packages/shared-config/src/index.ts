import { config as loadDotenv } from 'dotenv';

type EnvSchema = {
  safeParse: (data: unknown) =>
    | { success: true; data: Record<string, unknown> }
    | { success: false; error: { message: string } };
};

let isLoaded = false;
const cachedValues = new Map<string, string>();

export const loadEnv = (schema?: EnvSchema) => {
  if (!isLoaded) {
    loadDotenv();
    isLoaded = true;
  }

  if (schema) {
    const result = schema.safeParse(process.env);
    if (!result.success) {
      throw new Error(`Invalid environment configuration: ${result.error.message}`);
    }

    const parsed = result.data as Record<string, unknown>;
    Object.entries(parsed).forEach(([key, value]) => {
      if (typeof value === 'string') {
        cachedValues.set(key, value);
      }
    });
  }
};

export const getEnv = (key: string, fallback?: string) => {
  if (cachedValues.has(key)) {
    return cachedValues.get(key) as string;
  }

  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing environment variable: ${key}`);
  }

  cachedValues.set(key, value);
  return value;
};
