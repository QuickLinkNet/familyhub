export type DashboardCardId = 'REMINDERS' | 'TODAY' | 'TASKS' | 'FAMILY' | 'REWARDS' | 'SHOPPING' | 'MEALS' | 'NOTES' | 'SCHOOL' | 'HOUSEHOLD' | 'GOALS' | 'WALL_MODE' | 'ADMIN_SETUP';
export type WallCardId = 'EVENTS' | 'TASKS' | 'REMINDERS' | 'GOALS' | 'NOTES' | 'SCHOOL' | 'FAMILY';

export type ProfilePreferences = {
  dashboardCards: DashboardCardId[];
  wallCards: WallCardId[];
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
};

export type ProfilePreferenceInput = ProfilePreferences;
