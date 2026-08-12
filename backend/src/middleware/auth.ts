import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import db from '../config/database';
import { config } from '../config/env';
import { UserRole } from '../types';
import { AuthError, ForbiddenError } from '../utils/errors';
import { verifyAccessToken } from '../services/authTokens.service';

function bearerToken(req: Request): string | undefined {
  const value = req.header('authorization');
  if (!value?.startsWith('Bearer ')) return undefined;
  return value.slice(7).trim() || undefined;
}

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token = bearerToken(req) ?? req.cookies?.[config.cookies.access];
    if (!token) throw new AuthError('Authentication required.');

    const claims = verifyAccessToken(token);
    const account = await db('AuthSessions as s')
      .join('Users as u', 'u.UserID', 's.UserID')
      .select('u.UserID', 'u.Role', 'u.SponsorID', 'u.FinanceFunction', 'u.IsActive', 'u.MustChangePassword', 's.RevokedAt', 's.ExpiresAt')
      .where({ 's.SessionID': claims.sessionId, 's.UserID': claims.userId })
      .first();

    if (!account || !account.IsActive || account.RevokedAt || new Date(account.ExpiresAt) <= new Date()) {
      throw new AuthError('Session is no longer active.');
    }

    req.user = {
      userId: account.UserID,
      role: account.Role as UserRole,
      sponsorId: account.SponsorID ?? null,
      financeFunction: account.FinanceFunction ?? null,
      sessionId: claims.sessionId,
    };
    const passwordRoute = req.originalUrl.startsWith('/api/v1/auth/change-password');
    const sessionRoute = req.originalUrl.startsWith('/api/v1/auth/me') || req.originalUrl.startsWith('/api/v1/auth/logout');
    if (account.MustChangePassword && !passwordRoute && !sessionRoute) {
      throw new ForbiddenError('Password change is required before accessing this resource.');
    }
    next();
  } catch (error) {
    if (error instanceof AuthError) return next(error);
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      return next(new AuthError('Session token is invalid or expired.'));
    }
    next(error);
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) return next(new AuthError('Authentication required.'));
    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError('You are not allowed to perform this action.'));
    }
    next();
  };
}

export function requireFinanceFunction(...functions: Array<'Maker' | 'Checker'>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) return next(new AuthError('Authentication required.'));
    if (req.user.role !== 'Finance' || !req.user.financeFunction
      || !functions.includes(req.user.financeFunction)) {
      return next(new ForbiddenError(`Finance ${functions.join(' or ')} access is required.`));
    }
    next();
  };
}
