import { z } from 'zod/v4';
import { validateBody } from '../middleware/validate';

export const screeningDecisionSchema = z.object({
  decision: z.enum(['Approve', 'Reject']),
  notes: z.string().trim().min(5, 'A clear decision rationale is required').max(1000),
  returnTo: z.enum(['DocumentReviewer', 'BGCheckOfficer', 'CloseApplication']).optional(),
  affectedItems: z.array(z.string().trim().min(1)).max(20).optional(),
}).superRefine((data, context) => {
  if (data.decision === 'Approve' && (data.returnTo || data.affectedItems?.length)) {
    context.addIssue({ code: 'custom', path: ['returnTo'], message: 'Approval cannot include a return target' });
  }
  if (data.decision === 'Reject' && !data.returnTo) {
    context.addIssue({ code: 'custom', path: ['returnTo'], message: 'Choose where the rejected case should go' });
  }
  if (data.decision === 'Reject' && data.returnTo !== 'CloseApplication' && !data.affectedItems?.length) {
    context.addIssue({ code: 'custom', path: ['affectedItems'], message: 'Select at least one affected item' });
  }
});

export const csrDecisionSchema = z.object({
  decision: z.enum(['Approve', 'Decline']),
  notes: z.string().trim().max(1000).optional(),
}).superRefine((data, context) => {
  if (data.decision === 'Decline' && !data.notes) {
    context.addIssue({ code: 'custom', path: ['notes'], message: 'Decline notes are required' });
  }
});

export type ScreeningDecisionInput = z.infer<typeof screeningDecisionSchema>;
export type CsrDecisionInput = z.infer<typeof csrDecisionSchema>;

export const validateScreeningDecision = validateBody(screeningDecisionSchema);
export const validateCsrDecision = validateBody(csrDecisionSchema);
