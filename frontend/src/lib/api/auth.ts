import { LoginCredentials, RegisterData, AuthResponse } from '@/types';
import { apiClient } from './client';

function persistAuth(response: AuthResponse) {
  if (response.token) {
    localStorage.setItem('auth_token', response.token);
    localStorage.setItem('auth_user', JSON.stringify(response.user));
  }
}

export const authApi = {
  login: async (credentials: LoginCredentials) => {
    const response = await apiClient<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (response.data) persistAuth(response.data);
    return response;
  },

  register: async (data: RegisterData) => {
    const response = await apiClient<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (response.data) persistAuth(response.data);
    return response;
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  },

  getUser: (): AuthResponse['user'] | null => {
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem('auth_user');
    return user ? JSON.parse(user) : null;
  },
};
