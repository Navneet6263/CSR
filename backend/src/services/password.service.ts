import crypto from 'crypto';
import bcrypt from 'bcrypt';
import db from '../config/database';
import { AuthError, ValidationError } from '../utils/errors';
import { hashToken } from './authTokens.service';
import { queueEmail } from './emailOutbox.service';
import { config } from '../config/env';
import { writeAudit } from './audit.service';
import { WorkflowActor } from './workflow.service';

const RESET_MINUTES = 30;

export async function requestPasswordReset(email: string, ipAddress?: string) {
  const user = await db('Users').where({ Email: email, IsActive: true }).first();
  if (!user) { hashToken(crypto.randomBytes(32).toString('base64url')); return; }
  const token = crypto.randomBytes(32).toString('base64url');
  await db.transaction(async (trx) => {
    await trx('PasswordResetTokens').where({ UserID: user.UserID }).whereNull('UsedAt').update({ UsedAt: new Date() });
    await trx('PasswordResetTokens').insert({ UserID: user.UserID, TokenHash: hashToken(token),
      ExpiresAt: new Date(Date.now() + RESET_MINUTES * 60_000), RequestIP: ipAddress?.slice(0, 64) ?? null });
    await queueEmail(trx, user.Email, 'PASSWORD_RESET', { name: user.FullName,
      resetUrl: `${config.frontendUrl}/reset-password?token=${encodeURIComponent(token)}` });
  });
}

export async function resetPassword(token: string, newPassword: string) {
  return db.transaction(async (trx) => {
    const rows = await trx.raw('SELECT * FROM PasswordResetTokens WITH (UPDLOCK, ROWLOCK) WHERE TokenHash = ?', [hashToken(token)]);
    const reset = Array.isArray(rows) ? rows[0] : undefined;
    if (!reset || reset.UsedAt || new Date(reset.ExpiresAt) <= new Date()) throw new ValidationError('Reset link is invalid or expired.');
    await trx('Users').where({ UserID: reset.UserID, IsActive: true }).update({ PasswordHash: await bcrypt.hash(newPassword, 12),
      MustChangePassword: false, TokenVersion: trx.raw('ISNULL(TokenVersion, 0) + 1'), UpdatedAt: new Date() });
    await trx('PasswordResetTokens').where({ ResetID: reset.ResetID }).update({ UsedAt: new Date() });
    await trx('AuthSessions').where({ UserID: reset.UserID }).whereNull('RevokedAt').update({ RevokedAt: new Date() });
    await writeAudit(trx, { userId: reset.UserID, action: 'PASSWORD_RESET', entityType: 'User', entityId: reset.UserID });
  });
}

export async function changePassword(userId: number, currentPassword: string, newPassword: string, actor: WorkflowActor) {
  return db.transaction(async (trx) => {
    const user = await trx('Users').where({ UserID: userId, IsActive: true }).first();
    if (!user || !await bcrypt.compare(currentPassword, user.PasswordHash)) throw new AuthError('Current password is incorrect.');
    if (await bcrypt.compare(newPassword, user.PasswordHash)) throw new ValidationError('New password must be different.');
    await trx('Users').where({ UserID: userId }).update({ PasswordHash: await bcrypt.hash(newPassword, 12),
      MustChangePassword: false, TokenVersion: Number(user.TokenVersion ?? 0) + 1, UpdatedAt: new Date() });
    await trx('AuthSessions').where({ UserID: userId }).whereNull('RevokedAt').update({ RevokedAt: new Date() });
    await writeAudit(trx, { userId, action: 'PASSWORD_CHANGED', entityType: 'User', entityId: userId,
      requestId: actor.requestId, ipAddress: actor.ipAddress });
  });
}
