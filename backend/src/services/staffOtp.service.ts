import crypto from 'crypto';
import db from '../config/database';
import { config } from '../config/env';
import { IUser } from '../types';
import { AuthError, ValidationError } from '../utils/errors';
import { queueEmail } from './emailOutbox.service';
import { hashToken } from './authTokens.service';
import { createSession, publicUser } from './session.service';
import { writeAudit } from './audit.service';

const OTP_TTL_MS = 10 * 60_000;
const MAX_ATTEMPTS = 5;

function codeHash(challengeId: string, code: string) {
  return crypto.createHmac('sha256', config.jwt.secret).update(`${challengeId}:${code}`).digest('hex');
}
function maskedEmail(email: string) {
  const [name, domain] = email.split('@');
  return `${name.slice(0, 2)}${'*'.repeat(Math.max(3, name.length - 2))}@${domain}`;
}

export async function createStaffOtpChallenge(user: IUser, ipAddress?: string, userAgent?: string) {
  const challengeId = crypto.randomUUID(); const code = crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
  await db.transaction(async (trx) => {
    await trx('LoginOtpChallenges').where({ UserID: user.UserID }).whereNull('UsedAt').update({ UsedAt: new Date() });
    await trx('LoginOtpChallenges').insert({ ChallengeID: challengeId, UserID: user.UserID,
      CodeHash: codeHash(challengeId, code), Attempts: 0, MaxAttempts: MAX_ATTEMPTS,
      ExpiresAt: new Date(Date.now() + OTP_TTL_MS), RequestIP: ipAddress?.slice(0, 64) ?? null,
      UserAgentHash: userAgent ? hashToken(userAgent) : null });
    await queueEmail(trx, user.Email, 'STAFF_LOGIN_OTP', { name: user.FullName, code, expiresMinutes: 10 });
  });
  return { otpRequired: true as const, challengeId, maskedEmail: maskedEmail(user.Email), expiresInSeconds: 600 };
}

export async function resendStaffOtp(challengeId: string, ipAddress?: string, userAgent?: string) {
  const challenge = await db('LoginOtpChallenges as c').join('Users as u', 'u.UserID', 'c.UserID')
    .select('c.CreatedAt as ChallengeCreatedAt', 'c.UsedAt', 'u.*').where('c.ChallengeID', challengeId).first() as (IUser & Record<string, any>) | undefined;
  if (!challenge || challenge.UsedAt || !challenge.IsActive) throw new AuthError('OTP session is unavailable. Sign in again.');
  if (Date.now() - new Date(challenge.ChallengeCreatedAt).getTime() < 60_000) {
    throw new ValidationError('Please wait 60 seconds before requesting another OTP.');
  }
  return createStaffOtpChallenge(challenge, ipAddress, userAgent);
}

export async function verifyStaffOtp(challengeId: string, code: string, ipAddress?: string, userAgent?: string) {
  const outcome = await db.transaction(async (trx) => {
    const result = await trx.raw(`SELECT c.*, u.* FROM LoginOtpChallenges c WITH (UPDLOCK, ROWLOCK)
      JOIN Users u ON u.UserID=c.UserID WHERE c.ChallengeID=?`, [challengeId]);
    const challenge = (Array.isArray(result) ? result[0] : undefined) as (IUser & Record<string, any>) | undefined;
    if (!challenge || challenge.UsedAt || !challenge.IsActive || new Date(challenge.ExpiresAt) <= new Date()
      || Number(challenge.Attempts) >= Number(challenge.MaxAttempts)) throw new AuthError('OTP is invalid or expired. Sign in again.');
    const valid = crypto.timingSafeEqual(Buffer.from(challenge.CodeHash), Buffer.from(codeHash(challengeId, code)));
    if (!valid) {
      await trx('LoginOtpChallenges').where({ ChallengeID: challengeId }).update({ Attempts: Number(challenge.Attempts) + 1 });
      return { valid: false as const };
    }
    await trx('LoginOtpChallenges').where({ ChallengeID: challengeId }).update({ UsedAt: new Date() });
    const tokens = await createSession(challenge, ipAddress, userAgent, trx);
    await writeAudit(trx, { userId: challenge.UserID, action: 'STAFF_LOGIN_OTP_VERIFIED', entityType: 'User',
      entityId: challenge.UserID, ipAddress });
    return { valid: true as const, user: publicUser(challenge), tokens };
  });
  if (!outcome.valid) throw new AuthError('OTP is incorrect or expired.');
  return outcome;
}
