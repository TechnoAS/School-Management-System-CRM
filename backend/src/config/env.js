import dotenv from 'dotenv';
import { z } from 'zod';
// Load env variables
dotenv.config();
const envSchema = z.object({
    PORT: z.string().transform((val) => parseInt(val, 10)).default('5000'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    DATABASE_URL: z.string(),
    DATABASE_POOL_MAX: z.string().transform((val) => parseInt(val, 10)).default('10'),
    JWT_ACCESS_SECRET: z.string().min(32),
    JWT_REFRESH_SECRET: z.string().min(32),
    JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
    JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
    BCRYPT_ROUNDS: z.string().transform((val) => parseInt(val, 10)).default('12'),
    CORS_ORIGIN: z.string().default('http://localhost:3000'),
    RATE_LIMIT_AUTH_MAX: z.string().transform((val) => parseInt(val, 10)).default('5'),
    RATE_LIMIT_API_MAX: z.string().transform((val) => parseInt(val, 10)).default('120'),
    UPLOAD_DIR: z.string().default('./uploads'),
    MAX_UPLOAD_MB: z.string().transform((val) => parseInt(val, 10)).default('5'),
    ALLOWED_MIME_TYPES: z.string().transform((val) => val.split(',')).default('image/jpeg,image/png,image/webp,application/pdf'),
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.string().transform((val) => parseInt(val, 10)).optional(),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    SMTP_FROM: z.string().optional(),
    LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('info'),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error('❌ Invalid environment configuration:');
    console.error(JSON.stringify(parsed.error.format(), null, 2));
    process.exit(1);
}
export const env = parsed.data;
