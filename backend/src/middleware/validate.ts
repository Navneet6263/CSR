import { Request, Response, NextFunction } from 'express';
import { z } from 'zod/v4';
import { ValidationError } from '../utils/errors';

export function validateBody<T>(schema: z.ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      const message = parsed.error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join('; ');
      next(new ValidationError(message));
      return;
    }
    req.body = parsed.data;
    next();
  };
}
