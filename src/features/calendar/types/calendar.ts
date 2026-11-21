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
  isPrivate: boolean;
  createdBy: { id: string; name: string | null } | null;
  members: CalendarEventMember[];
  createdAt: string;
  updatedAt: string;
  source: 'LOCAL' | 'EXTERNAL' | 'GOOGLE' | 'BIRTHDAY';
  editable: boolean;
  recurrence: CalendarRecurrence | null;
  reminders?: CalendarEventReminders;
}

export interface CalendarEventMember {
  id: string;
  name: string;
  color: string;
}

export type RecurrenceFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface CalendarRecurrence {
  frequency: RecurrenceFrequency;
  interval: number;
  until: string | null;
  weekdays: number[];
}

export interface CalendarEventReminders {
  offsetsMinutes: number[];
  boardSound: boolean;
}

export interface CalendarEventInput {
  calendarId: string;
  title: string;
  description?: string | null;
  location?: string | null;
  startsAt: string;
  endsAt: string;
  allDay: boolean;
  isPrivate?: boolean;
  memberIds?: string[];
  recurrenceFrequency?: RecurrenceFrequency | null;
  recurrenceInterval?: number;
  recurrenceUntil?: string | null;
  recurrenceWeekdays?: number[];
  reminderOffsets?: number[];
  boardSound?: boolean;
}
