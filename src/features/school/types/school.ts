export interface SchoolMemberRef { id: string; name: string; color: string }

export interface SchoolLesson {
  id: string;
  member: SchoolMemberRef;
  subject: string;
  weekday: number;
  startsAt: string;
  endsAt: string;
  room: string | null;
  teacher: string | null;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export type SchoolItemType = 'HOMEWORK' | 'TEST';

export interface SchoolItem {
  id: string;
  member: SchoolMemberRef;
  itemType: SchoolItemType;
  subject: string;
  title: string;
  description: string | null;
  dueDate: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SchoolBoard { lessons: SchoolLesson[]; items: SchoolItem[] }
export interface SchoolLessonInput { memberId: string; subject: string; weekday: number; startsAt: string; endsAt: string; room: string; teacher: string; color: string }
export interface SchoolItemInput { memberId: string; itemType: SchoolItemType; subject: string; title: string; description: string; dueDate: string }
