import { AuthResponse, AuthUser, LoginCredentials, RegisterData } from '@/types';
import { apiClient } from './client';

function persistUser(user: AuthUser) {
  if (typeof window !== 'undefined') localStorage.setItem('auth_user', JSON.stringify(user));
}

function clearUser() {
  if (typeof window !== 'undefined') localStorage.removeItem('auth_user');
}

export const authApi = {
  login: async (credentials: LoginCredentials) => {
    const response = await apiClient<AuthResponse>('/auth/login', {
      method: 'POST', body: JSON.stringify(credentials),
    });
    if (response.data?.user) persistUser(response.data.user);
    return response;
  },

  register: async (data: RegisterData) => {
    const response = await apiClient<AuthResponse>('/auth/register', {
      method: 'POST', body: JSON.stringify(data),
    });
    if (response.data?.user) persistUser(response.data.user);
    return response;
  },

  restoreSession: async () => {
    try {
      const response = await apiClient<AuthUser>('/auth/me');
      if (response.data) persistUser(response.data);
      return response.data ?? null;
    } catch {
      clearUser();
      return null;
    }
  },

  forgotPassword: (data: { email: string }) => apiClient('/auth/forgot-password', {
    method: 'POST', body: JSON.stringify(data),
  }),
  resetPassword: (data: { token: string; newPassword: string }) => apiClient('/auth/reset-password', {
    method: 'POST', body: JSON.stringify(data),
  }),
  changePassword: (data: { currentPassword: string; newPassword: string }) => apiClient('/auth/change-password', {
    method: 'POST', body: JSON.stringify(data),
  }),

  logout: async () => {
    try { await apiClient('/auth/logout', { method: 'POST' }); } catch { /* session is cleared locally */ }
    clearUser();
    if (typeof window !== 'undefined') window.location.href = '/login';
  },

  getUser: (): AuthUser | null => {
    if (typeof window === 'undefined') return null;
    const value = localStorage.getItem('auth_user');
    try { return value ? JSON.parse(value) as AuthUser : null; } catch { clearUser(); return null; }
  },
};
