import crypto from 'crypto';
import { Knex } from 'knex';
import db from '../config/database';
import { IUser } from '../types';
import { hashToken, issueSessionTokens } from './authTokens.service';

const REFRESH_DAYS = 7;

export function publicUser(user: IUser) {
  return { id: user.UserID, userId: user.UserID, fullName: user.FullName, email: user.Email, phone: user.Phone,
    role: user.Role, sponsorId: user.SponsorID ?? null, financeFunction: user.FinanceFunction ?? null,
    mustChangePassword: Boolean(user.MustChangePassword) };
}

export async function createSession(user: IUser, ipAddress?: string, userAgent?: string, executor: Knex | Knex.Transaction = db) {
  const sessionId = crypto.randomUUID(); const tokens = issueSessionTokens(user.UserID, user.Role, sessionId);
  await executor('AuthSessions').insert({ SessionID: sessionId, UserID: user.UserID,
    RefreshTokenHash: tokens.refreshHash, ExpiresAt: new Date(Date.now() + REFRESH_DAYS * 86_400_000),
    IPAddress: ipAddress?.slice(0, 64) ?? null, UserAgentHash: userAgent ? hashToken(userAgent) : null });
  return tokens;
}
