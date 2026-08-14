import {
  DocumentChecklistItem, ReviewApplicationRow, DocReviewPayload,
  DocUploadPayload, BGCheckApplicationRow, BGCheckPayload,
} from '@/types/domain';
import type { RawReviewerLog } from '@/types/reviewer';
import type { OfficerCaseDetail, OfficerLog, OfficerStats } from '@/types/officer';
import { mapDocument, mapReviewApp, mapBGApp } from '@/lib/mappers';
import { apiClient } from './client';

type Page<T> = { applications?: T[]; logs?: T[]; pagination: { page: number; limit: number; total: number } };

export const verificationApi = {
  getPendingDocs: async (params = '') => {
    const res = await apiClient<Page<Record<string, unknown>>>(`/verify/docs/pending${params ? `?${params}` : ''}`);
    return { ...res, data: { applications: (res.data?.applications || []).map(mapReviewApp) as ReviewApplicationRow[], pagination: res.data?.pagination } };
  },

  reviewDoc: (id: number, data: DocReviewPayload) =>
    apiClient(`/verify/docs/${id}/review`, { method: 'PUT', body: JSON.stringify(data) }),

  getReUploads: async () => {
    const res = await apiClient<Record<string, unknown>[]>('/verify/docs/reuploads');
    return { ...res, data: (res.data || []).map(mapDocument) as DocumentChecklistItem[] };
  },

  uploadDoc: (data: DocUploadPayload) =>
    apiClient('/verify/docs/upload', { method: 'POST', body: JSON.stringify(data) }),

  getPendingBGChecks: async (params = '') => {
    const res = await apiClient<Page<Record<string, unknown>>>(`/verify/bg-checks/pending${params ? `?${params}` : ''}`);
    return { ...res, data: { applications: (res.data?.applications || []).map(mapBGApp) as BGCheckApplicationRow[], pagination: res.data?.pagination } };
  },

  submitBGCheck: (appId: number, data: BGCheckPayload) =>
    apiClient(`/verify/bg-checks/${appId}`, { method: 'POST', body: JSON.stringify(data) }),

  getBGCheckDetails: async (appId: number) => {
    return apiClient<OfficerCaseDetail>(`/verify/bg-checks/${appId}`);
  },

  getAppDocs: async (applicationId: number) => {
    return apiClient<Record<string, unknown>>(`/verify/docs/application/${applicationId}`);
  },

  getReviewerLogs: async (params = '') => {
    return apiClient<{ logs: RawReviewerLog[]; pagination: { page: number; limit: number; total: number } }>(`/verify/logs${params ? `?${params}` : ''}`);
  },

  getOfficerLogs: async (params = '') => {
    return apiClient<{ logs: OfficerLog[]; pagination: { page: number; limit: number; total: number } }>(`/verify/bg-checks/logs${params ? `?${params}` : ''}`);
  },

  getOfficerStats: async () => {
    return apiClient<OfficerStats>('/verify/bg-checks/stats');
  },

  getReviewerStats: async () => {
    return apiClient<Record<string, unknown>>('/verify/stats');
  },
};
