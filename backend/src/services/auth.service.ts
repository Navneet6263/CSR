import crypto from 'crypto';
import bcrypt from 'bcrypt';
import db from '../config/database';
import { config } from '../config/env';
import { IUser } from '../types';
import { AuthError, ConflictError } from '../utils/errors';
import { RegisterInput } from '../validators/auth.validator';
import { hashToken, issueSessionTokens, verifyRefreshToken } from './authTokens.service';
import { createSession, publicUser } from './session.service';

const SALT_ROUNDS = 12;
export async function registerUser(
  data: RegisterInput,
  ipAddress?: string,
  userAgent?: string,
) {
  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
  const user = await db.transaction(async (trx) => {
    const existing = await trx<IUser>('Users').where({ Email: data.email }).first();
    if (existing) throw new ConflictError('An account with this email already exists.');

    const internalCode = `USR${crypto.randomBytes(8).toString('hex').slice(0, 16)}`;
    const [inserted] = await trx('Users').insert({
      FullName: data.fullName,
      Email: data.email,
      Phone: data.phone ?? null,
      PasswordHash: passwordHash,
      Role: 'Student',
      AgentCode: internalCode,
      IsActive: true,
    }).returning('*');
    await trx('Students').insert({ UserID: inserted.UserID });
    await trx('UserConsents').insert({
      UserID: inserted.UserID,
      ConsentType: 'USER_AGREEMENT_PRIVACY_POLICY',
      DocumentVersion: config.termsVersion,
      IPAddressHash: ipAddress ? hashToken(ipAddress) : null,
      UserAgentHash: userAgent ? hashToken(userAgent) : null,
    });
    return inserted as IUser;
  });

  const tokens = await createSession(user, ipAddress, userAgent);
  return { user: publicUser(user), tokens };
}

export async function loginUser(
  email: string,
  password: string,
  ipAddress?: string,
  userAgent?: string,
) {
  const user = await db<IUser>('Users').where({ Email: email }).first();
  const valid = user ? await bcrypt.compare(password, user.PasswordHash) : false;
  if (!user || !valid) throw new AuthError('Invalid email or password.');
  if (!user.IsActive) throw new AuthError('Account is deactivated. Please contact support.');

  // TEMPORARY: Staff OTP is disabled for every dashboard role until the OTP
  // database/email flow is restored. Keep password validation and normal
  // session creation active for Admin, reviewers, Finance, CSR, and students.
  // if (user.Role !== 'Student') return createStaffOtpChallenge(user, ipAddress, userAgent);

  const tokens = await createSession(user, ipAddress, userAgent);
  return { user: publicUser(user), tokens };
}

export async function rotateRefreshToken(refreshToken: string) {
  let claims;
  try {
    claims = verifyRefreshToken(refreshToken);
  } catch {
    throw new AuthError('Refresh session is invalid or expired.');
  }

  const session = await db('AuthSessions as s')
    .join('Users as u', 'u.UserID', 's.UserID')
    .select('s.*', 'u.Role', 'u.IsActive')
    .where('s.SessionID', claims.sessionId)
    .first();
  if (!session || session.RevokedAt || !session.IsActive || new Date(session.ExpiresAt) <= new Date()) {
    throw new AuthError('Refresh session is no longer active.');
  }
  if (session.RefreshTokenHash !== hashToken(refreshToken)) {
    await db('AuthSessions').where({ SessionID: claims.sessionId }).update({ RevokedAt: new Date() });
    throw new AuthError('Refresh token reuse detected.');
  }

  const tokens = issueSessionTokens(claims.userId, session.Role, claims.sessionId);
  await db('AuthSessions').where({ SessionID: claims.sessionId }).update({
    RefreshTokenHash: tokens.refreshHash,
    LastUsedAt: new Date(),
  });
  return tokens;
}

export async function revokeSession(sessionId: string): Promise<void> {
  await db('AuthSessions').where({ SessionID: sessionId }).update({ RevokedAt: new Date() });
}
