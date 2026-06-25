import type { StudentProfile } from '@/types';

export function calculateProfileCompletion(profile: StudentProfile | null): number {
  if (!profile) return 0;
  
  let completedFields = 0;
  const totalFields = 5; // personal, family, education, bank, corporate
  
  // 1. Personal
  if (profile.fullName && profile.phone && profile.aadharNumber && profile.address) {
    completedFields++;
  }
  
  // 2. Family
  if (profile.fatherName && profile.annualFamilyIncome && profile.religion) {
    completedFields++;
  }

  // 3. Education
  if (profile.institutionId && profile.course && profile.tenthMarks) {
    completedFields++;
  }

  // 4. Bank
  if (profile.bankAccountNo && profile.bankIFSC) {
    completedFields++;
  }

  // 5. Corporate (Optional but required for 100%)
  if (profile.statementOfPurpose && profile.extracurricularActivities) {
    completedFields++;
  }

  return Math.round((completedFields / totalFields) * 100);
}
