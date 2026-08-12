import { apiClient } from './client';
import type { SupportActivity, SupportOverview, SupportStudentDetail, SupportStudentRow, SupportTicket } from '@/types/support';

export const supportApi = {
  overview: () => apiClient<SupportOverview>('/support/overview'),
  students: (query = '', page = 1, limit = 25) => apiClient<{ data: SupportStudentRow[]; pagination: { page: number; limit: number; total: number } }>(
    `/support/students?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`),
  student: (id: number) => apiClient<SupportStudentDetail>(`/support/students/${id}`),
  activity: () => apiClient<SupportActivity[]>('/support/activity'),
  recordActivity: (data: Record<string, unknown>) => apiClient('/support/activity', { method: 'POST', body: JSON.stringify(data) }),
  createTicket: (data: Record<string, unknown>) => apiClient('/support/tickets', { method: 'POST', body: JSON.stringify(data) }),
  tickets: (status = 'All', mine = false, query = '') => apiClient<SupportTicket[]>(
    `/support/tickets?status=${encodeURIComponent(status)}&mine=${mine}&query=${encodeURIComponent(query)}`),
  ticket: (id: number) => apiClient<{ ticket: SupportTicket; events: Array<Record<string, unknown>>;
    contacts: Array<Record<string, unknown>> }>(`/support/tickets/${id}`),
  updateTicket: (id: number, data: Record<string, unknown>) => apiClient(`/support/tickets/${id}`, {
    method: 'PATCH', body: JSON.stringify(data),
  }),
  addEvent: (id: number, data: Record<string, unknown>) => apiClient(`/support/tickets/${id}/events`, {
    method: 'POST', body: JSON.stringify(data),
  }),
};
