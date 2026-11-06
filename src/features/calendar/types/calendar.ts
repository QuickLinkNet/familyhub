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
  source: 'LOCAL' | 'EXTERNAL' | 'GOOGLE';
  editable: boolean;
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
