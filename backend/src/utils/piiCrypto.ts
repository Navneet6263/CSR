import crypto from 'crypto';
import { config } from '../config/env';

const key = crypto.createHash('sha256').update(config.piiEncryptionKey).digest();

export function encryptPii(value: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1.${iv.toString('base64url')}.${tag.toString('base64url')}.${encrypted.toString('base64url')}`;
}

export function decryptPii(value?: string | null): string | null {
  if (!value) return null;
  const [version, ivPart, tagPart, dataPart] = value.split('.');
  if (version !== 'v1' || !ivPart || !tagPart || !dataPart) return null;
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(ivPart, 'base64url'));
  decipher.setAuthTag(Buffer.from(tagPart, 'base64url'));
  return Buffer.concat([
    decipher.update(Buffer.from(dataPart, 'base64url')),
    decipher.final(),
  ]).toString('utf8');
}

export function hashPii(value: string): string {
  return crypto.createHmac('sha256', key).update(value.trim().toLowerCase()).digest('hex');
}

export function maskValue(value?: string | null, visible = 4): string | null {
  if (!value) return null;
  return `${'*'.repeat(Math.max(0, value.length - visible))}${value.slice(-visible)}`;
}
