import { apiClient, downloadApiFile } from './index';

export const adminApi = {
  getDashboardMetrics: async () => {
    return await apiClient<any>('/admin/metrics');
  },

  getPipeline: async (role: 'reviewer' | 'bgchecker' | 'screener' | 'csr', page: number = 1, limit: number = 10) => {
    return await apiClient<{ data: Record<string, unknown>[]; total: number;
      workload: Array<{ userId?: number; sponsorId?: number; count: number }> }>(`/admin/pipeline/${role}?page=${page}&limit=${limit}`);
  },

  toggleHold: async (applicationId: number, hold: boolean, reason?: string) => {
    return await apiClient<any>(`/admin/applications/${applicationId}/hold`, {
      method: 'POST',
      body: JSON.stringify({ hold, reason }),
    });
  },
  emergencyApprove: (applicationId: number, reason: string, confirmation: string, expectedStatus: string) =>
    apiClient<{ applicationId: number; fromStatus: string; status: string; approvedBy: number }>(
      `/admin/applications/${applicationId}/emergency-approve`, {
        method: 'POST', body: JSON.stringify({ reason, confirmation, expectedStatus }),
      },
    ),
  getUsers: () => apiClient<Record<string, unknown>[]>('/admin/users'),
  createUser: (data: Record<string, unknown>) => apiClient<Record<string, unknown>>('/admin/users', {
    method: 'POST', body: JSON.stringify(data),
  }),
  deactivateUser: (userId: number) => apiClient(`/admin/users/${userId}`, { method: 'DELETE' }),
  getAuditEvents: () => apiClient<Record<string, unknown>[]>('/admin/audit-events'),
  getPaymentQueue: () => apiClient<Record<string, unknown>[]>('/admin/payment-queue'),
  getSponsors: () => apiClient<Record<string, unknown>[]>('/admin/sponsors'),
  getScholarshipOverview: (id: number) => apiClient<Record<string, any>>(`/admin/scholarships/${id}/overview`),
  getAnnouncements: () => apiClient<Record<string, any>[]>('/admin/announcements'),
  createAnnouncement: (data: Record<string, unknown>) => apiClient('/admin/announcements', { method: 'POST', body: JSON.stringify(data) }),
  archiveAnnouncement: (id: number) => apiClient(`/admin/announcements/${id}`, { method: 'DELETE' }),
  getBroadcasts: () => apiClient<Record<string, any>[]>('/admin/broadcasts'),
  sendBroadcast: (data: Record<string, unknown>) => apiClient('/admin/broadcasts', { method: 'POST', body: JSON.stringify(data) }),
  getSupportTickets: () => apiClient<Record<string, any>[]>('/admin/support-tickets'),
  updateSupportTicket: (id: number, status: string) => apiClient(`/admin/support-tickets/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  getSlaAnalytics: () => apiClient<Array<Record<string, any>>>('/admin/analytics/sla'),
  getGeoAnalytics: () => apiClient<{ states: Array<Record<string, any>>; cities: Array<Record<string, any>> }>('/admin/analytics/geo'),
  bulkHold: (applicationIds: number[], hold: boolean, reason: string) => apiClient<Record<string, number>>('/admin/applications/bulk-hold', {
    method: 'POST', body: JSON.stringify({ applicationIds, hold, reason }),
  }),
  downloadReport: (type: 'sla' | 'funnel' | 'diversity' | 'disbursement' | 'audit') =>
    downloadApiFile(`/admin/reports/${type}/export`, { method: 'POST' }),
};
