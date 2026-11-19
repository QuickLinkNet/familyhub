import { apiDelete, apiGet, apiPost, setCsrfToken } from '../../../services/apiClient';
import type { AuthSession } from '../../auth/types/auth';
import type { AuthDevice, InvitationPreview, MobileInvitation } from '../types/companion';

export const createMobileInvitation = (memberId: string) =>
  apiPost<MobileInvitation>('/auth/invitations', { memberId });

export const getInvitationPreview = (token: string, signal?: AbortSignal) =>
  apiGet<InvitationPreview>(`/auth/invitations/${encodeURIComponent(token)}`, signal);

export async function redeemMobileInvitation(token: string, deviceLabel: string): Promise<AuthSession> {
  const session = await apiPost<AuthSession>(`/auth/invitations/${encodeURIComponent(token)}/redeem`, { deviceLabel });
  setCsrfToken(session.csrfToken);
  return session;
}

export const getAuthDevices = (signal?: AbortSignal) => apiGet<AuthDevice[]>('/admin/devices', signal);
export const revokeAuthDevice = (id: string) => apiDelete<void>(`/admin/devices/${id}`);
