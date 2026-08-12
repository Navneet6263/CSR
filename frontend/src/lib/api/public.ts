import { apiClient } from './client';

export interface PublicScholarship {
  scholarshipId: number; name: string; description?: string; sponsorName: string;
  perStudentAmount: number; applicationCloseDate: string; maxApplicants?: number;
}
export interface PublicPortal {
  stats: { registeredStudents: number; studentsFunded: number; disbursed: number; activePartners: number };
  scholarships: PublicScholarship[]; partners: string[];
  outcomes: Array<{ course: string; beneficiaryCount: number; totalAwarded: number }>;
  announcements: Array<{ announcementId: number; title: string; message: string; publishedAt: string; expiresAt?: string }>;
}

export interface EligibilityMatch {
  scholarshipId: number; name: string; sponsorName: string; perStudentAmount: number;
  eligible: boolean; reasons: string[];
}

export const publicApi = {
  getPortal: () => apiClient<PublicPortal>('/public/portal', { signal: AbortSignal.timeout(5000) }),
  checkEligibility: (data: Record<string, unknown>) => apiClient<EligibilityMatch[]>('/public/eligibility', {
    method: 'POST', body: JSON.stringify(data),
  }),
};
