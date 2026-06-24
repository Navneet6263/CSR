import {
  DocumentChecklistItem, ReviewApplicationRow, DocReviewPayload,
  DocUploadPayload, BGCheckApplicationRow, BGCheckPayload,
} from '@/types/domain';
import { mapDocument, mapReviewApp, mapBGApp } from '@/lib/mappers';
import { apiClient } from './client';

export const verificationApi = {
  getPendingDocs: async () => {
    const res = await apiClient<Record<string, unknown>[]>('/verify/docs/pending');
    return { ...res, data: (res.data || []).map(mapReviewApp) as ReviewApplicationRow[] };
  },

  reviewDoc: (id: number, data: DocReviewPayload) =>
    apiClient(`/verify/docs/${id}/review`, { method: 'PUT', body: JSON.stringify(data) }),

  getReUploads: async () => {
    const res = await apiClient<Record<string, unknown>[]>('/verify/docs/reuploads');
    return { ...res, data: (res.data || []).map(mapDocument) as DocumentChecklistItem[] };
  },

  uploadDoc: (data: DocUploadPayload) =>
    apiClient('/verify/docs/upload', { method: 'POST', body: JSON.stringify(data) }),

  getPendingBGChecks: async () => {
    const res = await apiClient<Record<string, unknown>[]>('/verify/bg-checks/pending');
    return { ...res, data: (res.data || []).map(mapBGApp) as BGCheckApplicationRow[] };
  },

  submitBGCheck: (appId: number, data: BGCheckPayload) =>
    apiClient(`/verify/bg-checks/${appId}`, { method: 'POST', body: JSON.stringify(data) }),
};
