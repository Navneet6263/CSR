import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../utils/errors';
import { config } from '../config/env';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export function verifyCsrf(req: Request, _res: Response, next: NextFunction): void {
  if (SAFE_METHODS.has(req.method) || req.header('authorization')) {
    next();
    return;
  }

  if (!req.cookies?.[config.cookies.access] && !req.cookies?.[config.cookies.refresh]) {
    next();
    return;
  }

  const cookieToken = req.cookies?.[config.cookies.csrf] as string | undefined;
  const headerToken = req.header('x-csrf-token');
  if (!cookieToken || !headerToken || cookieToken.length !== headerToken.length) {
    next(new ForbiddenError('Invalid CSRF token.'));
    return;
  }

  const matches = crypto.timingSafeEqual(Buffer.from(cookieToken), Buffer.from(headerToken));
  if (!matches) {
    next(new ForbiddenError('Invalid CSRF token.'));
    return;
  }

  next();
}
