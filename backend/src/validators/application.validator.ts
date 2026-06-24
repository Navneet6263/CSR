import { z } from 'zod/v4';

// ─── Create Application Schema ──────────────────────────────────────────────
export const createApplicationSchema = z.object({
  scholarshipId: z.number().int().positive('ScholarshipID is required'),
});

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;

// ─── Submit Application ─────────────────────────────────────────────────────
// Submit only needs the :id param; no body validation required.
// We keep an empty schema for consistency if future fields are added.
export const submitApplicationSchema = z.object({});

export type SubmitApplicationInput = z.infer<typeof submitApplicationSchema>;
