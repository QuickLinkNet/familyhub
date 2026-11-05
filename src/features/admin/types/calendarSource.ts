export type CalendarSyncStatus = 'NEVER' | 'SUCCESS' | 'ERROR';

export interface CalendarSource {
  id: string;
  name: string;
  provider: 'GOOGLE_ICAL';
  color: string;
  isActive: boolean;
  urlConfigured: boolean;
  urlHint: string;
  lastSyncedAt: string | null;
  lastSyncStatus: CalendarSyncStatus;
  lastSyncMessage: string | null;
  syncWindowStart: string | null;
  syncWindowEnd: string | null;
}

export interface CalendarSourceInput {
  name: string;
  url?: string;
  color: string;
  isActive: boolean;
}
