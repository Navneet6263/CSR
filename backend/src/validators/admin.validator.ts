import { z } from 'zod/v4';
import { validateBody } from '../middleware/validate';

export const holdApplicationSchema = z.object({
  hold: z.boolean(),
  reason: z.string().trim().max(1000).optional(),
}).superRefine((data, context) => {
  if (data.hold && !data.reason) {
    context.addIssue({ code: 'custom', path: ['reason'], message: 'A hold reason is required' });
  }
});

export const validateHoldApplication = validateBody(holdApplicationSchema);

export const bulkHoldSchema = z.object({
  applicationIds: z.array(z.number().int().positive()).min(1).max(100)
    .transform((values) => [...new Set(values)].sort((a, b) => a - b)),
  hold: z.boolean(),
  reason: z.string().trim().min(3).max(1000),
});

export const emergencyApprovalSchema = z.object({
  reason: z.string().trim().min(20, 'Provide a detailed reason of at least 20 characters').max(1000),
  confirmation: z.string().trim().regex(/^APP-\d+$/i, 'Type the application ID, for example APP-123'),
  expectedStatus: z.string().trim().min(1).max(40),
});

export type EmergencyApprovalInput = z.infer<typeof emergencyApprovalSchema>;
