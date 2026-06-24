import { z } from 'zod/v4';
import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../utils/errors';

export const docReviewSchema = z.object({
  status: z.enum(['Verified', 'Rejected']),
  rejectionReason: z.string().optional(),
}).refine(data => data.status !== 'Rejected' || (data.rejectionReason && data.rejectionReason.trim() !== ''), {
  message: "Rejection reason is required when status is Rejected",
  path: ["rejectionReason"]
});

export type DocReviewInput = z.infer<typeof docReviewSchema>;

export const bgCheckSchema = z.object({
  checkType: z.string().min(1, 'Check type is required'),
  result: z.enum(['Pass', 'Fail', 'Inconclusive']),
  notes: z.string().optional(),
  evidenceUrl: z.string().optional(),
});

export type BgCheckInput = z.infer<typeof bgCheckSchema>;

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
