import { z } from 'zod/v4';

// ─── Update Student Profile Schema ──────────────────────────────────────────
export const updateStudentProfileSchema = z.object({
  aadharNumber: z.string().length(12, 'Aadhar must be 12 digits').optional(),
  dob: z.string().date('Invalid date format (YYYY-MM-DD)').optional(),
  gender: z.enum(['Male', 'Female', 'Other']).optional(),
  category: z.enum(['General', 'OBC', 'SC', 'ST']).optional(),
  address: z.string().min(5).max(500).optional(),
  city: z.string().min(2).max(100).optional(),
  state: z.string().min(2).max(100).optional(),
  pincode: z.string().min(6).max(10).optional(),
  annualFamilyIncome: z.number().min(0).optional(),
  familySize: z.number().int().min(1).optional(),
  course: z.string().min(2).max(200).optional(),
  institutionId: z.number().int().positive().optional(),
  enrollmentYear: z.number().int().min(2000).max(2100).optional(),
  bankAccountNo: z.string().min(5).max(50).optional(),
  bankIFSC: z.string().min(11).max(20).optional(),
  bankName: z.string().min(2).max(100).optional(),
});

export type UpdateStudentProfileInput = z.infer<typeof updateStudentProfileSchema>;
