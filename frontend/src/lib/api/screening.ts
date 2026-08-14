import {
  ScreeningApplicationRow, CSRApplicationRow,
  ScreeningPayload, CSRPayload,
} from '@/types/domain';
import { mapScreeningApp, mapCSRApp } from '@/lib/mappers';
import { apiClient } from './client';
import type { ScreenerStats, ScreeningDecisionRequest, ScreeningDetail } from '@/types/screening';

type ApplicationPage<T> = { applications: T[]; pagination: { page: number; limit: number; total: number } };

export const screeningApi = {
  getStats: async () => {
    return await apiClient<ScreenerStats>('/screening/stats');
  },

  getPendingScreening: async (params = '') => {
    const res = await apiClient<ApplicationPage<Record<string, unknown>>>(`/screening/pending${params ? `?${params}` : ''}`);
    return { ...res, data: { applications: (res.data?.applications || []).map(mapScreeningApp) as ScreeningApplicationRow[], pagination: res.data?.pagination } };
  },

  getHistory: async (params = '') => {
    const res = await apiClient<ApplicationPage<Record<string, unknown>>>(`/screening/history${params ? `?${params}` : ''}`);
    return { ...res, data: { applications: (res.data?.applications || []).map(mapScreeningApp) as ScreeningApplicationRow[], pagination: res.data?.pagination } };
  },

  getConsolidated: async (id: number) => {
    return await apiClient<ScreeningDetail>(`/screening/${id}/consolidated`);
  },

  approveApplication: (id: number, notes: string) =>
    apiClient(`/screening/${id}/decision`, { method: 'POST', body: JSON.stringify({ decision: 'Approve', notes }) }),

  rejectApplication: (id: number, notes: string) =>
    apiClient(`/screening/${id}/decision`, { method: 'POST', body: JSON.stringify({ decision: 'Reject', notes }) }),

  submitScreeningDecision: (id: number, data: ScreeningDecisionRequest) =>
    apiClient(`/screening/${id}/decision`, { method: 'POST', body: JSON.stringify(data) }),

  submitScreening: (id: number, data: ScreeningPayload) =>
    apiClient(`/screening/${id}/decision`, { method: 'POST', body: JSON.stringify(data) }),

  getPendingCSR: async (params = '') => {
    const res = await apiClient<ApplicationPage<Record<string, unknown>>>(`/screening/csr/pending${params ? `?${params}` : ''}`);
    return { ...res, data: { applications: (res.data?.applications || []).map(mapCSRApp) as CSRApplicationRow[], pagination: res.data?.pagination } };
  },
  getCSRStats: () => apiClient<Record<string, unknown>>('/screening/csr/stats'),
  getCSRHistory: (params = '') => apiClient<ApplicationPage<Record<string, unknown>>>(`/screening/csr/history${params ? `?${params}` : ''}`),
  getCSRApplication: (id: number) => apiClient<Record<string, unknown>>(`/screening/csr/${id}`),

  submitCSR: (id: number, data: CSRPayload) =>
    apiClient(`/screening/csr/${id}/decision`, { method: 'POST', body: JSON.stringify(data) }),
};
