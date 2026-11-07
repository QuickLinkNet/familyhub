export type CalendarType = 'SHARED' | 'PERSONAL' | 'EXTERNAL' | 'GOOGLE';

export interface FamilyCalendar {
  id: string;
  name: string;
  color: string;
  type: CalendarType;
  ownerMember: { id: string; name: string | null } | null;
  isActive: boolean;
  writable: boolean;
}

export interface CalendarEvent {
  id: string;
  seriesId: string | null;
  seriesStartsAt?: string;
  seriesEndsAt?: string;
  calendar: { id: string; name: string; color: string };
  title: string;
  description: string | null;
  location: string | null;
  startsAt: string;
  endsAt: string;
  allDay: boolean;
  createdBy: { id: string; name: string | null } | null;
  createdAt: string;
  updatedAt: string;
  source: 'LOCAL' | 'EXTERNAL' | 'GOOGLE' | 'BIRTHDAY';
  editable: boolean;
  recurrence: CalendarRecurrence | null;
}

export type RecurrenceFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface CalendarRecurrence {
  frequency: RecurrenceFrequency;
  interval: number;
  until: string | null;
}

export interface CalendarEventInput {
  calendarId: string;
  title: string;
  description?: string | null;
  location?: string | null;
  startsAt: string;
  endsAt: string;
  allDay: boolean;
  recurrenceFrequency?: RecurrenceFrequency | null;
  recurrenceInterval?: number;
  recurrenceUntil?: string | null;
}
