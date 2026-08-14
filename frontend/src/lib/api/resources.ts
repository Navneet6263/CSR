import { StudentProfile, Scholarship, EligibilityRule, Application, ScholarshipContentRecord, ScholarshipStructuredContent } from '@/types';
import { ScholarshipListResponse } from '@/types/domain';
import { apiClient } from './client';

import { mapApplication, mapEligibilityRule, mapInstitution, mapScholarship, mapStudentProfile } from '../mappers';

export const studentApi = {
  getProfile: async () => {
    const res = await apiClient<any>('/students/me');
    return { ...res, data: mapStudentProfile(res.data) };
  },
  updateProfile: (data: Partial<StudentProfile>) =>
    apiClient<StudentProfile>('/students/me', { method: 'PUT', body: JSON.stringify(data) }),
  getDocuments: () => apiClient<any[]>('/students/me/documents'),
  getMatches: (scholarshipIds?: number[]) => apiClient<{
    matched: Array<{ scholarshipId: number; name: string }>;
    failed: Array<{ scholarshipId: number; name: string; reasons: string[] }>;
  }>(`/students/me/matches${scholarshipIds?.length ? `?scholarshipIds=${scholarshipIds.join(',')}` : ''}`),
  uploadDocument: (docType: string, file: File) => {
    const formData = new FormData();
    formData.append('docType', docType);
    formData.append('file', file);
    return apiClient<{ fileUrl: string }>('/students/me/documents', {
      method: 'POST',
      body: formData as any,
    });
  }
};

export const scholarshipApi = {
  getAll: (params?: string) =>
    apiClient<ScholarshipListResponse>(`/scholarships${params ? '?' + params : ''}`),
  getById: async (id: number) => {
    const response = await apiClient<Record<string, unknown>>(`/scholarships/${id}`);
    return { ...response, data: mapScholarship(response.data) };
  },
  create: (data: Record<string, unknown>) =>
    apiClient<Record<string, unknown>>('/scholarships', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<Scholarship>) =>
    apiClient<Scholarship>(`/scholarships/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  pause: (id: number, data: { reason: string; resumeAt?: string; publishNotice: boolean }) =>
    apiClient<Scholarship>(`/scholarships/${id}/pause`, { method: 'POST', body: JSON.stringify(data) }),
  resume: (id: number) => apiClient<Scholarship>(`/scholarships/${id}/resume`, { method: 'POST' }),
  getRules: async (id: number) => {
    const response = await apiClient<Record<string, unknown>[]>(`/scholarships/${id}/rules`);
    return { ...response, data: (response.data ?? []).map(mapEligibilityRule) };
  },
  addRule: async (id: number, data: Partial<EligibilityRule>) => {
    const response = await apiClient<Record<string, unknown>>(`/scholarships/${id}/rules`, {
      method: 'POST', body: JSON.stringify(data),
    });
    return { ...response, data: mapEligibilityRule(response.data) };
  },
  updateRule: async (id: number, ruleId: number, data: Partial<EligibilityRule>) => {
    const response = await apiClient<Record<string, unknown>>(`/scholarships/${id}/rules/${ruleId}`, {
      method: 'PUT', body: JSON.stringify(data),
    });
    return { ...response, data: mapEligibilityRule(response.data) };
  },
  deleteRule: (id: number, ruleId: number) =>
    apiClient<void>(`/scholarships/${id}/rules/${ruleId}`, { method: 'DELETE' }),
  getContent: (id: number) => apiClient<ScholarshipContentRecord>(`/scholarships/${id}/content`),
  generateContent: (id: number, source?: File) => {
    const form = new FormData();
    if (source) form.append('source', source);
    return apiClient<ScholarshipContentRecord>(`/scholarships/${id}/content/generate`, { method: 'POST', body: form });
  },
  saveContent: (id: number, content: ScholarshipStructuredContent, changeNote?: string) =>
    apiClient<ScholarshipContentRecord>(`/scholarships/${id}/content`, {
      method: 'PUT', body: JSON.stringify({ content, changeNote }),
    }),
  publishContent: (id: number) => apiClient<ScholarshipContentRecord>(`/scholarships/${id}/content/publish`, { method: 'POST' }),
  uploadLogo: (id: number, logo: File) => {
    const form = new FormData(); form.append('logo', logo);
    return apiClient<{ scholarshipId: number; sponsorId: number; logoUrl: string }>(`/scholarships/${id}/logo`, { method: 'POST', body: form });
  },
};

export const applicationApi = {
  create: async (scholarshipId: number) => {
    const response = await apiClient<Record<string, unknown>>('/applications', {
      method: 'POST', body: JSON.stringify({ scholarshipId }),
    });
    return { ...response, data: mapApplication(response.data) };
  },
  submit: (id: number) =>
    apiClient<Application>(`/applications/${id}/submit`, { method: 'POST' }),
  getMy: async (params?: string) => {
    const response = await apiClient<{ applications: Record<string, unknown>[]; pagination: { page: number; limit: number; total: number } }>(`/applications/my${params ? `?${params}` : ''}`);
    return { ...response, data: { applications: (response.data?.applications ?? []).map(mapApplication), pagination: response.data.pagination } };
  },
  getById: (id: number) => apiClient<Record<string, unknown>>(`/applications/${id}`),
  getAll: (params?: string) =>
    apiClient<{ applications: Application[]; pagination: { page: number; limit: number; total: number }; statusCounts: Record<string, number> }>(`/applications${params ? '?' + params : ''}`),
};

export const institutionApi = {
  getAll: async () => {
    const response = await apiClient<Record<string, unknown>[]>('/institutions');
    return { ...response, data: (response.data ?? []).map(mapInstitution) };
  },
};
