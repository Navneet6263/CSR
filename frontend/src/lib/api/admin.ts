import { apiClient } from './index';
import { ApplicationRow, ApplicationDetailed } from '@/types/domain';

export const adminApi = {
  getDashboardMetrics: async () => {
    return await apiClient<any>('/admin/metrics');
  },

  getPipeline: async (role: 'reviewer' | 'bgchecker' | 'screener' | 'csr', page: number = 1, limit: number = 10) => {
    return await apiClient<{ data: ApplicationRow[]; total: number }>(`/admin/pipeline/${role}?page=${page}&limit=${limit}`);
  },

  toggleHold: async (applicationId: number, hold: boolean, reason?: string) => {
    return await apiClient<any>(`/admin/applications/${applicationId}/hold`, {
      method: 'POST',
      body: JSON.stringify({ hold, reason }),
    });
  },
};
