export type FamilyRole = 'ADMIN' | 'PARENT' | 'CHILD';

export interface FamilyMember {
  id: string;
  name: string;
  color: string;
  role: FamilyRole;
  isActive: boolean;
  avatarUrl: string | null;
  birthDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFamilyMemberInput {
  name: string;
  color: string;
  role: FamilyRole;
  password?: string;
  pin?: string;
  birthDate?: string | null;
}

export type UpdateFamilyMemberInput = CreateFamilyMemberInput & { isActive?: boolean };
