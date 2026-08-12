import { z } from 'zod/v4';

export const publicEligibilitySchema = z.object({
  gender: z.enum(['Male', 'Female', 'Other']).optional(), category: z.enum(['General', 'OBC', 'SC', 'ST']).optional(),
  state: z.string().trim().min(2).max(100).optional(), course: z.string().trim().min(2).max(200).optional(),
  annualFamilyIncome: z.number().min(0).max(100_000_000).optional(),
  previousYearMarks: z.number().min(0).max(100).optional(), age: z.number().int().min(10).max(100).optional(),
});
export type PublicEligibilityInput = z.infer<typeof publicEligibilitySchema>;
