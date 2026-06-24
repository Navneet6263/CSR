import { z } from 'zod/v4';
import { validate } from './auth.validator';

export const screeningDecisionSchema = z.object({
  decision: z.enum(['Approve', 'Reject']),
  notes: z.string().optional(),
});

export const csrDecisionSchema = z.object({
  decision: z.enum(['Approve', 'Decline']),
  notes: z.string().optional(),
});

export type ScreeningDecisionInput = z.infer<typeof screeningDecisionSchema>;
export type CsrDecisionInput = z.infer<typeof csrDecisionSchema>;

export const validateScreeningDecision = validate(screeningDecisionSchema);
export const validateCsrDecision = validate(csrDecisionSchema);
