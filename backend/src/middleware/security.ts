import compression from 'compression';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { RequestHandler } from 'express';

export const securityHeaders = helmet({
  crossOriginResourcePolicy: { policy: 'same-site' },
  contentSecurityPolicy: false,
  referrerPolicy: { policy: 'no-referrer' },
});

export const responseCompression = compression({
  threshold: 1024,
  filter: (_req, res) => !String(res.getHeader('content-type') ?? '').startsWith('application/pdf'),
});

function createLimiter(windowMs: number, limit: number, message: string): RequestHandler {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { success: false, data: null, message },
  });
}

export const apiRateLimit = createLimiter(
  5 * 60 * 1000,
  500,
  'Too many requests. Please retry shortly.',
);

export const authRateLimit = createLimiter(
  15 * 60 * 1000,
  12,
  'Too many authentication attempts. Please try again later.',
);
