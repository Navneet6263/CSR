import { z } from 'zod/v4';
import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../utils/errors';

// ─── Registration Schema ────────────────────────────────────────────────────
export const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(150),
  email: z.email('Invalid email address'),
  phone: z.string().min(10, 'Phone must be at least 10 digits').max(20).optional(),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100),
  role: z.enum(['Student', 'Agent']),
});

export type RegisterInput = z.infer<typeof registerSchema>;

// ─── Login Schema ───────────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ─── Generic Validation Middleware ──────────────────────────────────────────
export function validate<T>(schema: z.ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const messages = result.error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join('; ');

      next(new ValidationError(messages));
      return;
    }

    req.body = result.data;
    next();
  };
}
