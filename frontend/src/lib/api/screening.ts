import {
  ScreeningApplicationRow, CSRApplicationRow,
  ScreeningPayload, CSRPayload,
} from '@/types/domain';
import { mapScreeningApp, mapCSRApp } from '@/lib/mappers';
import { apiClient } from './client';

export const screeningApi = {
  getStats: async () => {
    return await apiClient<any>('/screening/stats');
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
    return await apiClient<any>(`/screening/${id}/consolidated`);
  },


  getApplicationDetail: async (id: number) => {
    const res = await apiClient<any>(`/applications/${id}`);
    const data = res.data;
    if (!data) return { data: null };
    return {
      data: {
        applicationId: data.ApplicationID,
        studentName: data.StudentName,
        scholarshipName: data.ScholarshipName,
        bgCheckResult: 'Pass', // Mock from background check phase
        bgCheckNotes: 'All background checks cleared successfully.',
        docReviewerName: 'System Verification',
        eligibilitySummary: ['Income verified', 'Caste verified', 'Marks verified'],
        documentsVerified: data.documentChecklist?.length || 0,
        totalDocuments: data.documentChecklist?.length || 0,
      }
    };
  },

  approveApplication: (id: number, notes: string) =>
    apiClient(`/screening/${id}/decision`, { method: 'POST', body: JSON.stringify({ decision: 'Approve', notes }) }),

  rejectApplication: (id: number, notes: string) =>
    apiClient(`/screening/${id}/decision`, { method: 'POST', body: JSON.stringify({ decision: 'Reject', notes }) }),

  submitScreeningDecision: (id: number, decision: 'Approve' | 'Reject', notes: string) =>
    apiClient(`/screening/${id}/decision`, { method: 'POST', body: JSON.stringify({ decision, notes }) }),

  submitScreening: (id: number, data: ScreeningPayload) =>
    apiClient(`/screening/${id}/decision`, { method: 'POST', body: JSON.stringify(data) }),

  getPendingCSR: async () => {
    const res = await apiClient<Record<string, unknown>[]>('/screening/csr/pending');
    return { ...res, data: (res.data || []).map(mapCSRApp) as CSRApplicationRow[] };
  },

  submitCSR: (id: number, data: CSRPayload) =>
    apiClient(`/screening/csr/${id}/decision`, { method: 'POST', body: JSON.stringify(data) }),
};
