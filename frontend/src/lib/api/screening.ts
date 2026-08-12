import {
  ScreeningApplicationRow, CSRApplicationRow,
  ScreeningPayload, CSRPayload,
} from '@/types/domain';
import { mapScreeningApp, mapCSRApp } from '@/lib/mappers';
import { apiClient } from './client';
import type { ScreenerStats, ScreeningDecisionRequest, ScreeningDetail } from '@/types/screening';

export const screeningApi = {
  getStats: async () => {
    return await apiClient<ScreenerStats>('/screening/stats');
  },

  getPendingScreening: async () => {
    const res = await apiClient<Record<string, unknown>[]>('/screening/pending');
    return { ...res, data: (res.data || []).map(mapScreeningApp) as ScreeningApplicationRow[] };
  },

  getHistory: async () => {
    const res = await apiClient<Record<string, unknown>[]>('/screening/history');
    return { ...res, data: (res.data || []).map(mapScreeningApp) as ScreeningApplicationRow[] };
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

  getPendingCSR: async () => {
    const res = await apiClient<Record<string, unknown>[]>('/screening/csr/pending');
    return { ...res, data: (res.data || []).map(mapCSRApp) as CSRApplicationRow[] };
  },
  getCSRStats: () => apiClient<Record<string, unknown>>('/screening/csr/stats'),
  getCSRHistory: () => apiClient<Record<string, unknown>[]>('/screening/csr/history'),
  getCSRApplication: (id: number) => apiClient<Record<string, unknown>>(`/screening/csr/${id}`),

  submitCSR: (id: number, data: CSRPayload) =>
    apiClient(`/screening/csr/${id}/decision`, { method: 'POST', body: JSON.stringify(data) }),
};
