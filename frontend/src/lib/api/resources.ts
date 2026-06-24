import { StudentProfile, Scholarship, EligibilityRule, Application, Institution } from '@/types';
import { ScholarshipListResponse } from '@/types/domain';
import { apiClient } from './client';

export const studentApi = {
  getProfile: () => apiClient<StudentProfile>('/students/me'),
  updateProfile: (data: Partial<StudentProfile>) =>
    apiClient<StudentProfile>('/students/me', { method: 'PUT', body: JSON.stringify(data) }),
  getDocuments: () => apiClient<any[]>('/students/me/documents'),
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
  getById: (id: number) => apiClient<Scholarship>(`/scholarships/${id}`),
  create: (data: Partial<Scholarship>) =>
    apiClient<Scholarship>('/scholarships', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<Scholarship>) =>
    apiClient<Scholarship>(`/scholarships/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getRules: (id: number) => apiClient<EligibilityRule[]>(`/scholarships/${id}/rules`),
  addRule: (id: number, data: Partial<EligibilityRule>) =>
    apiClient<EligibilityRule>(`/scholarships/${id}/rules`, {
      method: 'POST', body: JSON.stringify(data),
    }),
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
  getMy: () => apiClient<Application[]>('/applications/my'),
  getById: (id: number) => apiClient<Record<string, unknown>>(`/applications/${id}`),
  getAll: (params?: string) =>
    apiClient<{ applications: Application[] }>(`/applications${params ? '?' + params : ''}`),
};

export const institutionApi = {
  getAll: () => apiClient<Institution[]>('/institutions'),
};
