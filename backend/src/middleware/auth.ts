import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { AuthPayload, UserRole } from '../types';
import { AuthError, ForbiddenError } from '../utils/errors';

interface JwtPayload {
  userId: number;
  role: UserRole;
  iat?: number;
  exp?: number;
}

/**
 * Extracts and verifies JWT from the Authorization header.
 * Attaches the decoded payload to req.user.
 */
export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthError('No token provided. Please include Authorization header.');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new AuthError('Malformed Authorization header.');
    }

    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;

    const payload: AuthPayload = {
      userId: decoded.userId,
      role: decoded.role,
    };

    req.user = payload;
    next();
  } catch (error) {
    if (error instanceof AuthError) {
      next(error);
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      next(new AuthError('Invalid or expired token.'));
      return;
    }

    next(new AuthError('Authentication failed.'));
  }
}

/**
 * Middleware factory that restricts access to users whose role
 * is in the provided allowlist.
 */
export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AuthError('Authentication required.'));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(
        new ForbiddenError(
          `Access denied. Required role(s): ${roles.join(', ')}`
        )
      );
      return;
    }

    next();
  };
}
