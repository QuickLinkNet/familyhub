import { apiGet, apiPost, setCsrfToken } from '../../../services/apiClient';
import type { AuthProfile, AuthSession, LoginInput } from '../types/auth';

export const getAuthProfiles = (signal?: AbortSignal) => apiGet<AuthProfile[]>('/auth/profiles', signal);

export async function getAuthSession(signal?: AbortSignal): Promise<AuthSession> {
  const session = await apiGet<AuthSession>('/auth/me', signal);
  setCsrfToken(session.csrfToken);
  return session;
}

export async function login(input: LoginInput): Promise<AuthSession> {
  const session = await apiPost<AuthSession>('/auth/login', input);
  setCsrfToken(session.csrfToken);
  return session;
}

export async function logout(): Promise<void> {
  await apiPost<void>('/auth/logout', {});
  setCsrfToken(null);
}
