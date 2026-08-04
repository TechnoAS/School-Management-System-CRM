import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { z } from 'zod';

const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
dotenv.config({ path: path.join(backendRoot, '.env') });

const emptyToUndefined = (value) =>
    typeof value === 'string' && value.trim() === '' ? undefined : value;

const optionalString = () =>
    z.preprocess(emptyToUndefined, z.string().optional());

const optionalUrl = () =>
    z.preprocess(emptyToUndefined, z.string().url().optional());

const envSchema = z.object({
    PORT: z.string().transform((val) => parseInt(val, 10)).default('5000'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    MONGO_URI: z.string().min(1),
    DATABASE_POOL_MAX: z.string().transform((val) => parseInt(val, 10)).default('10'),
    DATABASE_SSL_CA_PATH: optionalString(),
    JWT_ACCESS_SECRET: z.string().min(32),
    JWT_REFRESH_SECRET: z.string().min(32),
    JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
    JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
    BCRYPT_ROUNDS: z.string().transform((val) => parseInt(val, 10)).default('12'),
    CORS_ORIGIN: z.string().default('http://localhost:3000'),
    RATE_LIMIT_AUTH_MAX: z.string().transform((val) => parseInt(val, 10)).default('5'),
    RATE_LIMIT_API_MAX: z.string().transform((val) => parseInt(val, 10)).default('120'),
    UPLOAD_DIR: z.string().default('./uploads'),
    STORAGE_PROVIDER: z.enum(['local', 'r2']).default('local'),
    MAX_UPLOAD_MB: z.string().transform((val) => parseInt(val, 10)).default('5'),
    ALLOWED_MIME_TYPES: z.string().transform((val) => val.split(',')).default('image/jpeg,image/png,image/webp,application/pdf'),
    R2_ACCOUNT_ID: optionalString(),
    R2_ACCESS_KEY_ID: optionalString(),
    R2_SECRET_ACCESS_KEY: optionalString(),
    R2_BUCKET: optionalString(),
    R2_ENDPOINT: optionalUrl(),
    R2_PUBLIC_BASE_URL: optionalUrl(),
    LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('info'),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error('Invalid environment configuration (check backend/.env):');
    console.error(JSON.stringify(parsed.error.format(), null, 2));
    process.exit(1);
}

export const env = parsed.data;
