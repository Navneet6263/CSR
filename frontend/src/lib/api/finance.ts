import {
  PaymentQueueRow, PendingPaymentRow,
  InitiatePaymentPayload, VerifyPaymentPayload,
} from '@/types/domain';
import { mapPaymentQueue, mapPendingPayment } from '@/lib/mappers';
import { apiClient } from './client';

type PaymentPage<T> = { payments: T[]; pagination: { page: number; limit: number; total: number } };

export const financeApi = {
  getPendingInitiation: async (params = '') => {
    const res = await apiClient<PaymentPage<Record<string, unknown>>>(`/finance/initiation/pending${params ? `?${params}` : ''}`);
    return { ...res, data: { payments: (res.data?.payments || []).map(mapPaymentQueue) as PaymentQueueRow[], pagination: res.data?.pagination } };
  },

  getOverview: () => apiClient<import('@/types/finance').FinanceOverview>('/finance/overview'),

  initiatePayment: (data: InitiatePaymentPayload) =>
    apiClient('/finance/initiation', {
      method: 'POST',
      headers: { 'Idempotency-Key': crypto.randomUUID() },
      body: JSON.stringify(data),
    }),

  getPendingVerifications: async (params = '') => {
    const res = await apiClient<PaymentPage<Record<string, unknown>>>(`/finance/verification/pending${params ? `?${params}` : ''}`);
    return { ...res, data: { payments: (res.data?.payments || []).map(mapPendingPayment) as PendingPaymentRow[], pagination: res.data?.pagination } };
  },

  verifyPayment: (id: number, data: VerifyPaymentPayload) =>
    apiClient(`/finance/verification/${id}`, { method: 'POST', body: JSON.stringify(data) }),

  getHistory: (status: 'completed' | 'failed', params = '') =>
    apiClient<PaymentPage<Record<string, unknown>>>(`/finance/history/${status}${params ? `?${params}` : ''}`),
  getAudit: (params = '') => apiClient<{ events: Record<string, unknown>[]; pagination: { page: number; limit: number; total: number } }>(`/finance/audit${params ? `?${params}` : ''}`),
};
