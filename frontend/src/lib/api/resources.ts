import { StudentProfile, Scholarship, EligibilityRule, Application } from '@/types';
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
  getMatches: () => apiClient<{
    matched: Array<{ scholarshipId: number; name: string }>;
    failed: Array<{ scholarshipId: number; name: string; reasons: string[] }>;
  }>('/students/me/matches'),
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
  deleteRule: (id: number, ruleId: number) =>
    apiClient<void>(`/scholarships/${id}/rules/${ruleId}`, { method: 'DELETE' }),
};

export const applicationApi = {
  create: (scholarshipId: number) =>
    apiClient<Application>('/applications', {
      method: 'POST', body: JSON.stringify({ scholarshipId }),
    }),
  submit: (id: number) =>
    apiClient<Application>(`/applications/${id}/submit`, { method: 'POST' }),
  getMy: async () => {
    const response = await apiClient<Record<string, unknown>[]>('/applications/my');
    return { ...response, data: (response.data ?? []).map(mapApplication) };
  },
  getById: (id: number) => apiClient<Record<string, unknown>>(`/applications/${id}`),
  getAll: (params?: string) =>
    apiClient<{ applications: Application[] }>(`/applications${params ? '?' + params : ''}`),
};

export const institutionApi = {
  getAll: async () => {
    const response = await apiClient<Record<string, unknown>[]>('/institutions');
    return { ...response, data: (response.data ?? []).map(mapInstitution) };
  },
};
