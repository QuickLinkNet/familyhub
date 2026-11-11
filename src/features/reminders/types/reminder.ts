import type { AuthRole } from '../../auth/types/auth';

export type ReminderType = 'EVENT' | 'TASK' | 'VERIFICATION' | 'SCHOOL' | 'ROUTINE';
export type ReminderUrgency = 'CRITICAL' | 'ATTENTION' | 'INFO';

export interface ReminderItem {
  id: string;
  type: ReminderType;
  urgency: ReminderUrgency;
  title: string;
  message: string;
  dueAt: string;
  member: { id: string; name: string; color: string } | null;
  action: { href: string; label: string };
}

export interface ReminderBoard {
  generatedAt: string;
  audience: { id: string; name: string; role: AuthRole };
  headline: string;
  summary: { total: number; critical: number; attention: number; info: number };
  items: ReminderItem[];
}
