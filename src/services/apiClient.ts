export type ApiSuccess<T> = { success: true; data: T };
export type ApiFailure = { success: false; error: { code: string; message: string } };
type ApiEnvelope<T> = ApiSuccess<T> | ApiFailure;

export class ApiError extends Error {
  constructor(public readonly code: string, message: string, public readonly status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? import.meta.env.BASE_URL.replace(/\/$/, '') + '/api/v1';
let csrfToken: string | null = null;

export function setCsrfToken(token: string | null): void {
  csrfToken = token;
}

export async function apiRequest<T>(path: string, method: string, body?: unknown, signal?: AbortSignal): Promise<T> {
  const hasBody = body !== undefined;
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method,
    headers: {
      Accept: 'application/json',
      ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
      ...(csrfToken !== null && !['GET', 'HEAD'].includes(method) ? { 'X-CSRF-Token': csrfToken } : {})
    },
    body: hasBody ? JSON.stringify(body) : undefined,
    signal,
    credentials: 'include'
  });

  if (response.status === 204) {
    return undefined as T;
  }

  let envelope: ApiEnvelope<T>;
  try {
    envelope = await response.json() as ApiEnvelope<T>;
  } catch {
    throw new ApiError('INVALID_RESPONSE', 'Der Server hat keine gültige Antwort geliefert.', response.status);
  }

  if (!response.ok || !envelope.success) {
    const error = envelope.success
      ? { code: 'REQUEST_FAILED', message: 'Die Anfrage ist fehlgeschlagen.' }
      : envelope.error;
    if (response.status === 401) {
      csrfToken = null;
    }
    throw new ApiError(error.code, error.message, response.status);
  }

  return envelope.data;
}

export const apiGet = <T>(path: string, signal?: AbortSignal) => apiRequest<T>(path, 'GET', undefined, signal);
export const apiPost = <T>(path: string, body: unknown) => apiRequest<T>(path, 'POST', body);
export const apiPut = <T>(path: string, body: unknown) => apiRequest<T>(path, 'PUT', body);
export const apiDelete = <T>(path: string) => apiRequest<T>(path, 'DELETE');
