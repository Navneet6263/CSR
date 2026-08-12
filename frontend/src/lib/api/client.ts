import { ApiResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
const unsafeMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const inFlightGets = new Map<string, Promise<ApiResponse<unknown>>>();

export class ApiError extends Error {
  constructor(message: string, public readonly status: number, public readonly requestId?: string) {
    super(message);
  }
}

function cookie(name: string) {
  if (typeof document === 'undefined') return undefined;
  return document.cookie.split('; ').find((item) => item.startsWith(`${name}=`))?.split('=').slice(1).join('=');
}

function requestHeaders(options: RequestInit) {
  const headers = new Headers(options.headers);
  if (options.body != null && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (unsafeMethods.has((options.method ?? 'GET').toUpperCase())) {
    const csrf = cookie('tb_csrf');
    if (csrf) headers.set('X-CSRF-Token', decodeURIComponent(csrf));
  }
  return headers;
}

async function parseResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const contentType = response.headers.get('content-type') ?? '';
  const body = contentType.includes('application/json') ? await response.json() : null;
  if (!response.ok) {
    throw new ApiError(body?.message || 'Request failed', response.status, body?.requestId);
  }
  return body as ApiResponse<T>;
}

async function execute<T>(endpoint: string, options: RequestInit) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    cache: 'no-store',
    credentials: 'include',
    headers: requestHeaders(options),
  });
  return { response, result: response.ok ? await parseResponse<T>(response) : null };
}

async function requestWithRefresh<T>(endpoint: string, options: RequestInit): Promise<ApiResponse<T>> {
  const first = await execute<T>(endpoint, options);
  if (first.response.ok) return first.result!;
  const canRefresh = first.response.status === 401 && !endpoint.startsWith('/auth/');
  if (canRefresh) {
    const refresh = await execute<unknown>('/auth/refresh', { method: 'POST' });
    if (refresh.response.ok) {
      const retry = await execute<T>(endpoint, options);
      return parseResponse<T>(retry.response);
    }
  }
  return parseResponse<T>(first.response);
}

export async function apiClient<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const method = (options.method ?? 'GET').toUpperCase();
  if (method !== 'GET') return requestWithRefresh<T>(endpoint, options);

  const existing = inFlightGets.get(endpoint) as Promise<ApiResponse<T>> | undefined;
  if (existing) return existing;

  const request = requestWithRefresh<T>(endpoint, options);
  inFlightGets.set(endpoint, request as Promise<ApiResponse<unknown>>);
  try {
    return await request;
  } finally {
    if (inFlightGets.get(endpoint) === request) inFlightGets.delete(endpoint);
  }
}

export async function downloadApiFile(endpoint: string, options: RequestInit = {}) {
  const request = () => fetch(`${API_BASE_URL}${endpoint}`, {
    ...options, credentials: 'include', headers: requestHeaders(options),
  });
  let response = await request();
  if (response.status === 401 && !endpoint.startsWith('/auth/')) {
    const refresh = await execute<unknown>('/auth/refresh', { method: 'POST' });
    if (refresh.response.ok) response = await request();
  }
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ApiError(body?.message || 'Download failed', response.status, body?.requestId);
  }
  const disposition = response.headers.get('content-disposition') ?? '';
  const filename = disposition.match(/filename="?([^";]+)"?/i)?.[1] ?? 'report.csv';
  return { blob: await response.blob(), filename };
}

export { API_BASE_URL };
