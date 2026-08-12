import crypto from 'crypto';
import { Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { UserRole } from '../types';

export interface SessionTokens {
  accessToken: string;
  refreshToken: string;
  csrfToken: string;
  refreshHash: string;
}

export interface TokenClaims {
  userId: number;
  role: UserRole;
  sessionId: string;
  type: 'access' | 'refresh';
}

export function hashToken(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

export function issueSessionTokens(
  userId: number,
  role: UserRole,
  sessionId: string,
): SessionTokens {
  const base = { userId, role, sessionId };
  const accessToken = jwt.sign(
    { ...base, type: 'access' },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'] },
  );
  const refreshToken = jwt.sign(
    { ...base, type: 'refresh', nonce: crypto.randomUUID() },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiresIn as jwt.SignOptions['expiresIn'] },
  );
  const csrfToken = crypto.randomBytes(32).toString('base64url');
  return { accessToken, refreshToken, csrfToken, refreshHash: hashToken(refreshToken) };
}

export function verifyAccessToken(token: string): TokenClaims {
  const claims = jwt.verify(token, config.jwt.secret) as TokenClaims;
  if (claims.type !== 'access' || !claims.sessionId) throw new jwt.JsonWebTokenError('Wrong token type');
  return claims;
}

export function verifyRefreshToken(token: string): TokenClaims {
  const claims = jwt.verify(token, config.jwt.refreshSecret) as TokenClaims;
  if (claims.type !== 'refresh' || !claims.sessionId) throw new jwt.JsonWebTokenError('Wrong token type');
  return claims;
}

const baseCookie = {
  httpOnly: true,
  secure: config.cookies.secure,
  sameSite: 'strict' as const,
};

export function setSessionCookies(res: Response, tokens: SessionTokens): void {
  res.cookie(config.cookies.access, tokens.accessToken, {
    ...baseCookie,
    path: '/',
    maxAge: 15 * 60 * 1000,
  });
  res.cookie(config.cookies.refresh, tokens.refreshToken, {
    ...baseCookie,
    path: '/api/v1/auth',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.cookie(config.cookies.csrf, tokens.csrfToken, {
    httpOnly: false,
    secure: config.cookies.secure,
    sameSite: 'strict',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export function clearSessionCookies(res: Response): void {
  res.clearCookie(config.cookies.access, { ...baseCookie, path: '/' });
  res.clearCookie(config.cookies.refresh, { ...baseCookie, path: '/api/v1/auth' });
  res.clearCookie(config.cookies.csrf, { path: '/' });
}
