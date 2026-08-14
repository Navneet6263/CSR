import { z } from 'zod/v4';

const embeddedRuleFields = z.object({
  ruleType: z.enum(['Income', 'Age', 'Gender', 'Category', 'State', 'Course', 'Institution', 'Enrollment', 'FamilySize', 'Marks']),
  operator: z.enum(['LT', 'LTE', 'GT', 'GTE', 'EQ', 'NEQ', 'IN', 'NOT_IN', 'BETWEEN']),
  valueMin: z.string().max(200).optional(), valueMax: z.string().max(200).optional(),
  valueList: z.string().max(5000).optional(), isRequired: z.boolean().default(true),
});

function validateRuleValues(data: Partial<z.infer<typeof embeddedRuleFields>>, context: z.RefinementCtx) {
  if (!data.operator) return;
  if (['LT', 'LTE', 'GT', 'GTE', 'EQ', 'NEQ'].includes(data.operator) && !data.valueMin) {
    context.addIssue({ code: 'custom', path: ['valueMin'], message: 'A comparison value is required' });
  }
  if (data.operator === 'BETWEEN' && (!data.valueMin || !data.valueMax)) {
    context.addIssue({ code: 'custom', path: ['valueMax'], message: 'Both range values are required' });
  }
  if (['IN', 'NOT_IN'].includes(data.operator) && !data.valueList) {
    context.addIssue({ code: 'custom', path: ['valueList'], message: 'A value list is required' });
  }
}

const embeddedRuleSchema = embeddedRuleFields.superRefine(validateRuleValues);

// ─── Create / Update Scholarship Schema ─────────────────────────────────────
const scholarshipFields = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(200),
  description: z.string().max(5000).optional(),
  sponsorId: z.coerce.number().int().positive(),
  totalBudget: z.coerce.number().positive(),
  perStudentAmount: z.coerce.number().positive(),
  applicationOpenDate: z.string().date('Invalid date (YYYY-MM-DD)'),
  applicationCloseDate: z.string().date('Invalid date (YYYY-MM-DD)'),
  maxApplicants: z.coerce.number().int().positive().optional(),
  status: z.enum(['Active', 'Inactive', 'Closed']).default('Active'),
  rules: z.array(embeddedRuleSchema).min(1).max(30).optional(),
});

export const createScholarshipSchema = scholarshipFields.superRefine((data, context) => {
  if (data.applicationCloseDate <= data.applicationOpenDate) {
    context.addIssue({ code: 'custom', path: ['applicationCloseDate'], message: 'Close date must be after open date' });
  }
  if (data.perStudentAmount > data.totalBudget) {
    context.addIssue({ code: 'custom', path: ['perStudentAmount'], message: 'Amount cannot exceed total budget' });
  }
});

export type CreateScholarshipInput = z.infer<typeof createScholarshipSchema>;

export const updateScholarshipSchema = scholarshipFields.omit({ rules: true }).partial();

export type UpdateScholarshipInput = z.infer<typeof updateScholarshipSchema>;

export const pauseScholarshipSchema = z.object({
  reason: z.string().trim().min(10, 'Please provide a clear pause reason').max(1000),
  resumeAt: z.string().datetime().optional(),
  publishNotice: z.boolean().default(true),
}).superRefine((data, context) => {
  if (data.resumeAt && new Date(data.resumeAt).getTime() <= Date.now()) {
    context.addIssue({ code: 'custom', path: ['resumeAt'], message: 'Resume date must be in the future' });
  }
});

export type PauseScholarshipInput = z.infer<typeof pauseScholarshipSchema>;

// ─── Eligibility Rule Schema ────────────────────────────────────────────────
export const eligibilityRuleSchema = z.object({ scholarshipId: z.coerce.number().int().positive() })
  .and(embeddedRuleSchema);

export type EligibilityRuleInput = z.infer<typeof eligibilityRuleSchema>;

export const updateEligibilityRuleSchema = embeddedRuleFields.partial().superRefine(validateRuleValues);

export type UpdateEligibilityRuleInput = z.infer<typeof updateEligibilityRuleSchema>;

const shortList = z.array(z.string().trim().min(2).max(500)).min(1).max(30);

export const scholarshipContentSchema = z.object({
  overview: z.string().trim().min(20).max(5000),
  highlights: shortList,
  eligibility: shortList,
  benefits: shortList,
  requiredDocuments: shortList,
  applicationSteps: shortList,
  termsAndConditions: shortList,
  contact: z.object({
    email: z.string().trim().email().max(200).optional().or(z.literal('')),
    phone: z.string().trim().max(30).optional(),
    website: z.string().trim().url().max(500).optional().or(z.literal('')),
  }),
  faqs: z.array(z.object({
    question: z.string().trim().min(3).max(500),
    answer: z.string().trim().min(3).max(2000),
  })).max(20).default([]),
});

export const updateScholarshipContentSchema = z.object({
  content: scholarshipContentSchema,
  changeNote: z.string().trim().min(3).max(500).optional(),
});

export type ScholarshipContentInput = z.infer<typeof scholarshipContentSchema>;
