import {
  ScreeningApplicationRow, CSRApplicationRow,
  ScreeningPayload, CSRPayload,
} from '@/types/domain';
import { mapScreeningApp, mapCSRApp } from '@/lib/mappers';
import { apiClient } from './client';

export const screeningApi = {
  getPendingScreening: async () => {
    const res = await apiClient<Record<string, unknown>[]>('/screening/pending');
    return { ...res, data: (res.data || []).map(mapScreeningApp) as ScreeningApplicationRow[] };
  },

  submitScreening: (id: number, data: ScreeningPayload) =>
    apiClient(`/screening/${id}/decision`, { method: 'POST', body: JSON.stringify(data) }),

  getPendingCSR: async () => {
    const res = await apiClient<Record<string, unknown>[]>('/screening/csr/pending');
    return { ...res, data: (res.data || []).map(mapCSRApp) as CSRApplicationRow[] };
  },

  submitCSR: (id: number, data: CSRPayload) =>
    apiClient(`/screening/csr/${id}/decision`, { method: 'POST', body: JSON.stringify(data) }),
};
