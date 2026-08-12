import crypto from 'crypto';
import path from 'path';
import dotenv from 'dotenv';
import { z } from 'zod/v4';

dotenv.config({ quiet: true });

const boolFromEnv = z
  .enum(['true', 'false'])
  .transform((value) => value === 'true');

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),
  TRUST_PROXY: z.coerce.number().int().min(0).max(3).default(1),
  DB_HOST: z.string().min(1).default('localhost'),
  DB_PORT: z.coerce.number().int().min(1).max(65535).default(1433),
  DB_USER: z.string().min(1).default('sa'),
  DB_PASSWORD: z.string().default(''),
  DB_NAME: z.string().min(1).default('ScholarshipDB'),
  DB_ENCRYPT: boolFromEnv.default(true),
  DB_TRUST_SERVER_CERT: boolFromEnv.default(false),
  DB_POOL_MIN: z.coerce.number().int().min(0).max(20).default(2),
  DB_POOL_MAX: z.coerce.number().int().min(2).max(50).default(15),
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32).optional(),
  PII_ENCRYPTION_KEY: z.string().min(32).optional(),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGINS: z.string().default('http://localhost:3000'),
  COOKIE_SECURE: boolFromEnv.optional(),
  PRIVATE_UPLOAD_ROOT: z.string().optional(),
  API_URL: z.string().url().optional(),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  CLAMAV_HOST: z.string().optional(),
  CLAMAV_PORT: z.coerce.number().int().min(1).max(65535).default(3310),
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  TERMS_VERSION: z.string().trim().min(1).max(64).default('privacy-1.0-2024-01'),
  SMTP_HOST: z.string().optional(), SMTP_PORT: z.coerce.number().int().min(1).max(65535).default(587),
  SMTP_SECURE: boolFromEnv.default(false), SMTP_USER: z.string().optional(), SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join('; ');
  throw new Error(`Invalid environment configuration: ${details}`);
}

const env = parsed.data;
const refreshSecret = env.JWT_REFRESH_SECRET
  ?? crypto.createHash('sha256').update(`${env.JWT_SECRET}:refresh`).digest('hex');
const piiKey = env.PII_ENCRYPTION_KEY
  ?? crypto.createHash('sha256').update(`${env.JWT_SECRET}:development-pii`).digest('hex');

if (env.NODE_ENV === 'production' && env.DB_TRUST_SERVER_CERT) {
  throw new Error('DB_TRUST_SERVER_CERT must be false in production.');
}
if (env.NODE_ENV === 'production' && !env.PII_ENCRYPTION_KEY) {
  throw new Error('PII_ENCRYPTION_KEY is required in production.');
}
if (env.NODE_ENV === 'production' && !env.CLAMAV_HOST) {
  throw new Error('CLAMAV_HOST is required in production for document scanning.');
}
if (env.NODE_ENV === 'production' && (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS || !env.SMTP_FROM)) {
  throw new Error('SMTP_HOST, SMTP_USER, SMTP_PASS and SMTP_FROM are required in production.');
}

export const config = {
  env: env.NODE_ENV,
  isProduction: env.NODE_ENV === 'production',
  port: env.PORT,
  trustProxy: env.TRUST_PROXY,
  corsOrigins: env.CORS_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean),
  apiUrl: env.API_URL,
  logLevel: env.LOG_LEVEL,
  privateUploadRoot: path.resolve(env.PRIVATE_UPLOAD_ROOT ?? path.join(process.cwd(), 'private_uploads')),
  db: {
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    name: env.DB_NAME,
    encrypt: env.DB_ENCRYPT,
    trustServerCertificate: env.DB_TRUST_SERVER_CERT,
    poolMin: env.DB_POOL_MIN,
    poolMax: env.DB_POOL_MAX,
  },
  jwt: {
    secret: env.JWT_SECRET,
    refreshSecret,
    expiresIn: env.JWT_EXPIRES_IN,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
  },
  piiEncryptionKey: piiKey,
  cookies: {
    access: 'tb_access',
    refresh: 'tb_refresh',
    csrf: 'tb_csrf',
    secure: env.COOKIE_SECURE ?? env.NODE_ENV === 'production',
  },
  clamav: { host: env.CLAMAV_HOST, port: env.CLAMAV_PORT },
  frontendUrl: env.FRONTEND_URL,
  termsVersion: env.TERMS_VERSION,
  smtp: { host: env.SMTP_HOST, port: env.SMTP_PORT, secure: env.SMTP_SECURE,
    user: env.SMTP_USER, pass: env.SMTP_PASS, from: env.SMTP_FROM },
} as const;
