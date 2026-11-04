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

export async function apiRequest<T>(path: string, method: string, body?: unknown, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method,
    headers: { Accept: 'application/json', ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
    credentials: 'same-origin'
  });
  if (response.status === 204) { return undefined as T; }
  let envelope: ApiEnvelope<T>;
  try { envelope = await response.json() as ApiEnvelope<T>; } catch { throw new ApiError('INVALID_RESPONSE', 'Der Server hat keine gÃƒÆ’Ã‚Â¼ltige Antwort geliefert.', response.status); }
  if (!response.ok || !envelope.success) {
    const error = envelope.success ? { code: 'REQUEST_FAILED', message: 'Die Anfrage ist fehlgeschlagen.' } : envelope.error;
    throw new ApiError(error.code, error.message, response.status);
  }
  return envelope.data;
}

export const apiGet = <T>(path: string, signal?: AbortSignal) => apiRequest<T>(path, 'GET', undefined, signal);
export const apiPost = <T>(path: string, body: unknown) => apiRequest<T>(path, 'POST', body);