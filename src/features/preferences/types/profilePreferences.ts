export type DashboardCardId = 'REMINDERS' | 'TODAY' | 'TASKS' | 'FAMILY' | 'REWARDS' | 'SHOPPING' | 'MEALS' | 'NOTES' | 'SCHOOL' | 'HOUSEHOLD' | 'GOALS' | 'WALL_MODE' | 'ADMIN_SETUP';
export type WallCardId = 'EVENTS' | 'TASKS' | 'REMINDERS' | 'GOALS' | 'NOTES' | 'SCHOOL' | 'FAMILY';
export type CalendarPreferenceView = 'DAY' | 'TIMELINE' | 'FIVE_DAY' | 'WEEK' | 'MONTH';

export type ProfilePreferences = {
  dashboardCards: DashboardCardId[];
  wallCards: WallCardId[];
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  calendarView: CalendarPreferenceView;
  calendarMemberIds: string[];
  calendarIds: string[];
};

export type ProfilePreferenceInput = Partial<ProfilePreferences>;
