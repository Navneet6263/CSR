import {
  PaymentQueueRow, PendingPaymentRow,
  InitiatePaymentPayload, VerifyPaymentPayload,
} from '@/types/domain';
import { mapPaymentQueue, mapPendingPayment } from '@/lib/mappers';
import { apiClient } from './client';

export const financeApi = {
  getPendingInitiation: async () => {
    const res = await apiClient<Record<string, unknown>[]>('/finance/initiation/pending');
    return { ...res, data: (res.data || []).map(mapPaymentQueue) as PaymentQueueRow[] };
  },

  getOverview: () => apiClient<import('@/types/finance').FinanceOverview>('/finance/overview'),

  initiatePayment: (data: InitiatePaymentPayload) =>
    apiClient('/finance/initiation', {
      method: 'POST',
      headers: { 'Idempotency-Key': crypto.randomUUID() },
      body: JSON.stringify(data),
    }),

  getPendingVerifications: async () => {
    const res = await apiClient<Record<string, unknown>[]>('/finance/verification/pending');
    return { ...res, data: (res.data || []).map(mapPendingPayment) as PendingPaymentRow[] };
  },

  verifyPayment: (id: number, data: VerifyPaymentPayload) =>
    apiClient(`/finance/verification/${id}`, { method: 'POST', body: JSON.stringify(data) }),

  getHistory: (status: 'completed' | 'failed') =>
    apiClient<Record<string, unknown>[]>(`/finance/history/${status}`),
  getAudit: () => apiClient<Record<string, unknown>[]>('/finance/audit'),
};
