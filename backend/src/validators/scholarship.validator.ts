import { z } from 'zod/v4';

// ─── Create / Update Scholarship Schema ─────────────────────────────────────
export const createScholarshipSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(200),
  description: z.string().max(5000).optional(),
  sponsorId: z.number().int().positive(),
  totalBudget: z.number().min(0),
  perStudentAmount: z.number().min(0),
  applicationOpenDate: z.string().date('Invalid date (YYYY-MM-DD)'),
  applicationCloseDate: z.string().date('Invalid date (YYYY-MM-DD)'),
  maxApplicants: z.number().int().positive().optional(),
  status: z.enum(['Active', 'Inactive', 'Closed']).default('Active'),
});

export type CreateScholarshipInput = z.infer<typeof createScholarshipSchema>;

export const updateScholarshipSchema = createScholarshipSchema.partial();

export type UpdateScholarshipInput = z.infer<typeof updateScholarshipSchema>;

// ─── Eligibility Rule Schema ────────────────────────────────────────────────
export const eligibilityRuleSchema = z.object({
  scholarshipId: z.number().int().positive(),
  ruleType: z.enum([
    'Income', 'Age', 'Gender', 'Category', 'State',
    'Course', 'Institution', 'Enrollment', 'FamilySize',
  ]),
  operator: z.enum(['LT', 'GT', 'EQ', 'IN', 'BETWEEN']),
  valueMin: z.string().max(200).optional(),
  valueMax: z.string().max(200).optional(),
  valueList: z.string().max(5000).optional(),
  isRequired: z.boolean().default(true),
});

export type EligibilityRuleInput = z.infer<typeof eligibilityRuleSchema>;

export const updateEligibilityRuleSchema = eligibilityRuleSchema
  .omit({ scholarshipId: true })
  .partial();

export type UpdateEligibilityRuleInput = z.infer<typeof updateEligibilityRuleSchema>;
