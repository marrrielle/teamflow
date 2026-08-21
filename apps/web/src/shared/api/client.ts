import { API_BASE_URL } from './config';

export interface ApiError {
  status: number;
  message: string;
}

export type ApiResponse<T> = { ok: true; data: T } | { ok: false; error: ApiError };

interface ApiErrorBody {
  error: { message: string };
}

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  if (typeof value !== 'object' || value === null || !('error' in value)) return false;
  const error = (value as Record<string, unknown>).error;
  return typeof error === 'object' && error !== null && typeof (error as Record<string, unknown>).message === 'string';
}

async function request<T>(path: string, init: RequestInit): Promise<ApiResponse<T>> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      ...init,
    });
  } catch {
    return { ok: false, error: { status: 0, message: 'Network error — is the API reachable?' } };
  }

  if (res.status === 204) {
    return { ok: true, data: undefined as T };
  }

  const body: unknown = await res.json().catch(() => null);

  if (!res.ok) {
    const message = isApiErrorBody(body) ? body.error.message : res.statusText;
    return { ok: false, error: { status: res.status, message } };
  }

  const data = body && typeof body === 'object' && 'data' in body ? (body as { data: unknown }).data : body;
  return { ok: true, data: data as T };
}

export const apiClient = {
  get: <T>(path: string): Promise<ApiResponse<T>> => request<T>(path, { method: 'GET' }),
  post: <TBody, TResponse>(path: string, body: TBody): Promise<ApiResponse<TResponse>> =>
    request<TResponse>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <TBody, TResponse>(path: string, body: TBody): Promise<ApiResponse<TResponse>> =>
    request<TResponse>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string): Promise<ApiResponse<T>> => request<T>(path, { method: 'DELETE' }),
};
