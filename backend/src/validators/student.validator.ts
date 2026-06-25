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
  institutionId: z.union([z.number().int().positive(), z.literal('other')]).optional(),
  otherInstitutionName: z.string().min(2).max(200).optional(),
  enrollmentYear: z.number().int().min(2000).max(2100).optional(),
  bankAccountNo: z.string().min(5).max(50).optional(),
  bankIFSC: z.string().min(11).max(20).optional(),
  bankName: z.string().min(2).max(100).optional(),
  
  // Extended Academic
  previousYearMarks: z.number().min(0).max(100).optional(),
  tenthBoardName: z.string().max(100).optional(),
  tenthPassingYear: z.number().int().min(1950).max(2100).optional(),
  tenthMarks: z.number().min(0).max(100).optional(),
  twelfthBoardName: z.string().max(100).optional(),
  twelfthPassingYear: z.number().int().min(1950).max(2100).optional(),
  twelfthMarks: z.number().min(0).max(100).optional(),
  currentSemesterOrYear: z.string().max(50).optional(),
  admissionRegistrationNo: z.string().max(100).optional(),

  // Extended Family
  fatherName: z.string().max(100).optional(),
  fatherOccupation: z.string().max(100).optional(),
  motherName: z.string().max(100).optional(),
  motherOccupation: z.string().max(100).optional(),

  // Extended Demographics
  religion: z.string().max(50).optional(),
  isDisabled: z.boolean().optional(),
  disabilityPercentage: z.number().min(0).max(100).optional(),
  domicileState: z.string().max(100).optional(),
  domicileDistrict: z.string().max(100).optional(),

  // Extended Financial
  tuitionFee: z.number().min(0).optional(),

  // Real-World Additions
  casteCertificateNumber: z.string().max(100).optional(),
  casteCertificateIssueDate: z.string().date().optional(),
  domicileCertificateNumber: z.string().max(100).optional(),
  alternatePhone: z.string().max(20).optional(),

  isHosteller: z.boolean().optional(),
  distanceFromHome: z.number().min(0).optional(),
  hasGapYear: z.boolean().optional(),
  gapYearExplanation: z.string().optional(),

  receivedPreviousScholarship: z.boolean().optional(),
  previousScholarshipName: z.string().max(200).optional(),
  previousScholarshipAmount: z.number().min(0).optional(),
  previousScholarshipYear: z.number().int().optional(),

  isAadhaarLinkedToBank: z.boolean().optional(),
  isEKYCVerified: z.boolean().optional(),

  statementOfPurpose: z.string().optional(),
  extracurricularActivities: z.string().optional(),
});

export type UpdateStudentProfileInput = z.infer<typeof updateStudentProfileSchema>;
