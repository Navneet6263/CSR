import { apiClient } from './client';

export interface NotificationRow {
  NotificationID: number; Type: string; Channel: string; Message: string;
  Priority?: 'Low' | 'Normal' | 'High' | 'Critical'; RequiresAction?: boolean; ActionURL?: string;
  GroupKey?: string; IsRead: boolean; ReadAt?: string; CreatedAt: string;
}

export const notificationApi = {
  list: () => apiClient<NotificationRow[]>('/notifications'),
  markRead: (id: number) => apiClient(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllRead: () => apiClient('/notifications/read-all', { method: 'PATCH' }),
};
