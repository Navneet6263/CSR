import { z } from 'zod/v4';
import { validateBody } from '../middleware/validate';

export const docReviewSchema = z.object({
  status: z.enum(['Verified', 'Rejected']),
  rejectionReason: z.string().optional(),
}).refine(data => data.status !== 'Rejected' || (data.rejectionReason && data.rejectionReason.trim() !== ''), {
  message: "Rejection reason is required when status is Rejected",
  path: ["rejectionReason"]
});

export type DocReviewInput = z.infer<typeof docReviewSchema>;

export const bgCheckSchema = z.object({
  checkType: z.enum(['Identity', 'Address', 'IncomeVerification']),
  result: z.enum(['Pass', 'Fail', 'Inconclusive']),
  notes: z.string().trim().max(2000).optional(),
  evidenceUrl: z.union([z.url().max(500), z.literal('')]).optional(),
}).superRefine((data, context) => {
  if (data.result !== 'Pass' && !data.notes) {
    context.addIssue({ code: 'custom', path: ['notes'], message: 'Notes are required for this result' });
  }
});

export type BgCheckInput = z.infer<typeof bgCheckSchema>;

export const reuploadLinkSchema = z.object({
  applicationId: z.coerce.number().int().positive(),
  documentType: z.string().trim().min(1).max(50),
});

export const validate = validateBody;
