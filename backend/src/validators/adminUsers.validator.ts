import { z } from 'zod/v4';

export const createStaffSchema = z.object({
  fullName: z.string().trim().min(2).max(150),
  email: z.email().max(200),
  role: z.enum(['Finance', 'CSRPartner', 'DocReviewer', 'BGCheckOfficer', 'ScreeningOfficer', 'SupportAgent']),
  financeFunction: z.enum(['Maker', 'Checker']).optional(),
  sponsorId: z.coerce.number().int().positive().optional(),
  organization: z.string().trim().min(2).max(150).optional(),
  fundCap: z.coerce.number().min(0).max(1_000_000_000).optional(),
}).superRefine((data, context) => {
  if (data.role === 'Finance' && !data.financeFunction) {
    context.addIssue({ code: 'custom', path: ['financeFunction'], message: 'Maker or Checker access is required.' });
  }
  if (data.role !== 'CSRPartner' || data.sponsorId) return;
  if (!data.organization) context.addIssue({ code: 'custom', path: ['organization'], message: 'Organization is required.' });
  if (!data.fundCap || data.fundCap <= 0) context.addIssue({ code: 'custom', path: ['fundCap'], message: 'A positive fund envelope is required.' });
});
