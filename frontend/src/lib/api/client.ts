import { ApiResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const USE_DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  if (USE_DEMO_MODE) {
    console.log(`[DEMO MODE] Intercepted request to ${endpoint}`);
    // Fake artificial delay to simulate network
    await new Promise((res) => setTimeout(res, 400));
    
    // Auth endpoints
    if (endpoint.includes('/auth/login')) {
      const email = typeof options.body === 'string' ? JSON.parse(options.body).email : 'admin@demo.com';
      return {
        success: true,
        message: 'Mock login successful',
        data: {
          token: 'demo-token-123',
          user: {
            userId: 99,
            fullName: email.split('@')[0],
            email,
            role: email.includes('student') ? 'Student' : email.includes('reviewer') ? 'DocReviewer' : 'Admin'
          }
        }
      } as any;
    }

    // Generic fallback for other endpoints returning arrays (like applications, scholarships)
    if (endpoint.includes('/applications/my')) return { success: true, data: [] } as any;
    if (endpoint.includes('/students/me')) return { success: true, data: {} } as any;
    if (endpoint.includes('/scholarships')) return { success: true, data: { scholarships: [] } } as any;
    
    return { success: true, data: null } as any;
  }

  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

  const headers: HeadersInit = {
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  // Default to application/json only if not FormData
  if (!(options.body instanceof FormData) && !('Content-Type' in headers)) {
    (headers as any)['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
}

export { API_BASE_URL };
