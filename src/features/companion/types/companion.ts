import type { AuthUser } from '../../auth/types/auth';

export interface MobileInvitation {
  url: string;
  expiresAt: string;
  profile: AuthUser;
}

export interface InvitationPreview {
  expiresAt: string;
  profile: AuthUser;
}

export interface AuthDevice {
  id: string;
  profile: { id: string; name: string; color: string };
  label: string;
  createdAt: string;
  lastSeenAt: string;
  revokedAt: string | null;
  current: boolean;
}
