export type SetupRole = 'ADMIN' | 'PARENT' | 'CHILD';

export interface SetupMemberInput {
  name: string;
  role: SetupRole;
  color: string;
  password?: string;
  pin?: string;
}

export interface SetupInput {
  householdName: string;
  locale: string;
  timezone: string;
  members: SetupMemberInput[];
}

export interface InstallationSummary {
  household: { id: string; name: string; locale: string; timezone: string };
  members: Array<{ id: string; name: string; role: SetupRole; color: string }>;
  calendars: Array<{ id: string; name: string; color: string; type: 'SHARED' | 'PERSONAL'; ownerMemberId: string | null }>;
  completedAt: string;
}

export interface SetupStatus {
  required: boolean;
  completed: boolean;
  version: string;
  installation: InstallationSummary | null;
}
