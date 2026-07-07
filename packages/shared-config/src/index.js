"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.z = exports.getEnv = exports.loadEnv = exports.baseEnvSchema = void 0;
const dotenv_1 = require("dotenv");
const find_up_1 = require("find-up");
const zod_1 = require("zod");
Object.defineProperty(exports, "z", { enumerable: true, get: function () { return zod_1.z; } });
exports.baseEnvSchema = zod_1.z.object({
    DATABASE_URL: zod_1.z.string().optional(),
    REDIS_URL: zod_1.z.string().optional(),
    JWT_ACCESS_SECRET: zod_1.z.string().min(16),
    JWT_REFRESH_SECRET: zod_1.z.string().min(32),
    ACCESS_TOKEN_TTL: zod_1.z.string().default("900"),
    REFRESH_TOKEN_TTL: zod_1.z.string().default("604800"),
    EMAIL_TOKEN_TTL: zod_1.z.string().default("600"),
    PASSWORD_RESET_TOKEN_TTL: zod_1.z.string().default("600"),
});
const cachedValues = new Map();
const loadedEnvFiles = new Set();
let envFilesBootstrapped = false;
const bootstrapEnvFiles = () => {
    if (envFilesBootstrapped) {
        return;
    }
    const externallyDefinedKeys = new Map();
    Object.keys(process.env).forEach((key) => {
        externallyDefinedKeys.set(key, process.env[key]);
    });
    const loadFile = (filename, override = false) => {
        if (!filename)
            return;
        const filePath = (0, find_up_1.findUpSync)(filename);
        if (filePath && !loadedEnvFiles.has(filePath)) {
            (0, dotenv_1.config)({ path: filePath, override });
            loadedEnvFiles.add(filePath);
        }
    };
    // Load files
    loadFile('.env');
    if (process.env.NODE_ENV)
        loadFile(`.env.${process.env.NODE_ENV}`, true);
    loadFile('.env.local', true);
    externallyDefinedKeys.forEach((value, key) => {
        if (value === undefined)
            delete process.env[key];
        else
            process.env[key] = value;
    });
    envFilesBootstrapped = true;
};
const loadEnv = (schema) => {
    bootstrapEnvFiles();
    if (schema) {
        const result = schema.safeParse(process.env);
        if (!result.success) {
            throw new Error(`Invalid environment configuration: ${JSON.stringify(result.error.issues, null, 2)}`);
        }
        const parsed = result.data;
        Object.entries(parsed).forEach(([key, value]) => {
            if (typeof value === 'string')
                cachedValues.set(key, value);
        });
    }
};
exports.loadEnv = loadEnv;
const getEnv = (key, fallback) => {
    if (cachedValues.has(key))
        return cachedValues.get(key);
    const value = process.env[key] ?? fallback;
    if (value === undefined) {
        throw new Error(`Missing environment variable: ${key}`);
    }
    cachedValues.set(key, value);
    return value;
};
exports.getEnv = getEnv;
//# sourceMappingURL=index.js.map