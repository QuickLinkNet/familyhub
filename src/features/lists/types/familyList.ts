export type ListVisibility = 'FAMILY' | 'ADULTS' | 'PRIVATE';

export interface ListMemberRef {
  id: string;
  name: string;
  color?: string;
}

export interface FamilyListItem {
  id: string;
  listId: string;
  title: string;
  note: string | null;
  isCompleted: boolean;
  assignedTo: ListMemberRef | null;
  createdBy: ListMemberRef;
  completedBy: ListMemberRef | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FamilyList {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  visibility: ListVisibility;
  createdBy: ListMemberRef;
  canManage: boolean;
  items: FamilyListItem[];
  createdAt: string;
  updatedAt: string;
}

export interface FamilyListInput {
  name: string;
  description: string;
  icon: string;
  color: string;
  visibility: ListVisibility;
}

export interface FamilyListItemInput {
  title: string;
  note: string;
  assignedToMemberId: string | null;
}
