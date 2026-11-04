export type CalendarType = 'SHARED' | 'PERSONAL';

export interface FamilyCalendar {
  id: string;
  name: string;
  color: string;
  type: CalendarType;
  ownerMember: { id: string; name: string | null } | null;
  isActive: boolean;
}

export interface CalendarEvent {
  id: string;
  calendar: { id: string; name: string; color: string };
  title: string;
  description: string | null;
  location: string | null;
  startsAt: string;
  endsAt: string;
  allDay: boolean;
  createdBy: { id: string; name: string | null };
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEventInput {
  calendarId: string;
  title: string;
  description?: string | null;
  location?: string | null;
  startsAt: string;
  endsAt: string;
  allDay: boolean;
}
