export type GoogleCalendarSyncStatus = 'NEVER' | 'SUCCESS' | 'ERROR';

export interface GoogleCalendarSource {
  id: string;
  name: string;
  color: string;
  accessRole: string;
  writable: boolean;
  isPrimary: boolean;
  isActive: boolean;
  lastSyncedAt: string | null;
  lastSyncStatus: GoogleCalendarSyncStatus;
  lastSyncMessage: string | null;
}

export interface GoogleCalendarConnection {
  configured: boolean;
  connected: boolean;
  clientIdHint: string | null;
  accountLabel: string | null;
  callbackUrl: string;
  scopes: string[];
  calendars: GoogleCalendarSource[];
}

export interface GoogleOAuthConfigInput {
  clientId: string;
  clientSecret: string;
}

export interface GoogleVerification {
  ready: boolean;
  activeCalendars: number;
  writableCalendars: number;
  synchronizedCalendars: number;
  errors: Array<{ id: string; name: string; message: string }>;
  verifiedAt: string;
}
