import { apiClient, downloadApiFile } from './index';

export const adminApi = {
  getDashboardMetrics: async () => {
    return await apiClient<any>('/admin/metrics');
  },

  getPipeline: async (role: 'reviewer' | 'bgchecker' | 'screener' | 'csr', page: number = 1, limit: number = 10, search = '') => {
    return await apiClient<{ data: Record<string, unknown>[]; total: number;
      workload: Array<{ userId?: number; sponsorId?: number; count: number }> }>(`/admin/pipeline/${role}?page=${page}&limit=${limit}${search ? `&search=${encodeURIComponent(search)}` : ''}`);
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
  getUsers: (params?: string) => apiClient<{ users: Record<string, unknown>[]; pagination: { page: number; limit: number; total: number }; summary: { total: number; csrPartners: number; internalStaff: number; inactive: number } }>(`/admin/users${params ? `?${params}` : ''}`),
  createUser: (data: Record<string, unknown>) => apiClient<Record<string, unknown>>('/admin/users', {
    method: 'POST', body: JSON.stringify(data),
  }),
  deactivateUser: (userId: number) => apiClient(`/admin/users/${userId}`, { method: 'DELETE' }),
  getAuditEvents: (params?: string) => apiClient<{ events: Record<string, unknown>[]; pagination: { page: number; limit: number; total: number }; facets: { ok: number; warn: number; info: number; danger: number } }>(`/admin/audit-events${params ? `?${params}` : ''}`),
  getPaymentQueue: (params = '') => apiClient<{ applications: Record<string, unknown>[]; pagination: { page: number; limit: number; total: number }; summary: { amount: number } }>(`/admin/payment-queue${params ? `?${params}` : ''}`),
  getSponsors: () => apiClient<Record<string, unknown>[]>('/admin/sponsors'),
  getScholarshipOverview: (id: number) => apiClient<Record<string, any>>(`/admin/scholarships/${id}/overview`),
  getAnnouncements: (params = '') => apiClient<{ announcements: Record<string, any>[]; pagination: { page: number; limit: number; total: number }; facets: { live: number; draft: number; expired: number } }>(`/admin/announcements${params ? `?${params}` : ''}`),
  createAnnouncement: (data: Record<string, unknown>) => apiClient('/admin/announcements', { method: 'POST', body: JSON.stringify(data) }),
  updateAnnouncement: (id: number, data: Record<string, unknown>) => apiClient(`/admin/announcements/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  archiveAnnouncement: (id: number) => apiClient(`/admin/announcements/${id}`, { method: 'DELETE' }),
  getBroadcasts: (params = '') => apiClient<{ broadcasts: Record<string, any>[]; pagination: { page: number; limit: number; total: number } }>(`/admin/broadcasts${params ? `?${params}` : ''}`),
  sendBroadcast: (data: Record<string, unknown>) => apiClient('/admin/broadcasts', { method: 'POST', body: JSON.stringify(data) }),
  getSupportTickets: (params = '') => apiClient<{ tickets: Record<string, any>[]; pagination: { page: number; limit: number; total: number }; facets: { open: number; progress: number; resolved: number; urgent: number; states: string[] } }>(`/admin/support-tickets${params ? `?${params}` : ''}`),
  updateSupportTicket: (id: number, status: string) => apiClient(`/admin/support-tickets/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  getSlaAnalytics: () => apiClient<Array<Record<string, any>>>('/admin/analytics/sla'),
  getGeoAnalytics: () => apiClient<{ states: Array<Record<string, any>>; cities: Array<Record<string, any>> }>('/admin/analytics/geo'),
  bulkHold: (applicationIds: number[], hold: boolean, reason: string) => apiClient<Record<string, number>>('/admin/applications/bulk-hold', {
    method: 'POST', body: JSON.stringify({ applicationIds, hold, reason }),
  }),
  downloadReport: (type: 'sla' | 'funnel' | 'diversity' | 'disbursement' | 'audit') =>
    downloadApiFile(`/admin/reports/${type}/export`, { method: 'POST' }),
};
