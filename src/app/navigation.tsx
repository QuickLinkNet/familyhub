import type { ReactNode } from 'react';
import { CalendarMonthRounded, ChecklistRounded, DashboardRounded, FamilyRestroomRounded, SettingsRounded, TvRounded } from '@mui/icons-material';
import type { AuthRole } from '../features/auth/types/auth';

export interface NavigationItem {
  label: string;
  path: string;
  icon: ReactNode;
  mobile: boolean;
  roles?: AuthRole[];
}

export const navigationItems: NavigationItem[] = [
  { label: 'Übersicht', path: '/', icon: <DashboardRounded />, mobile: true },
  { label: 'Wandmodus', path: '/wall', icon: <TvRounded />, mobile: false },
  { label: 'Kalender', path: '/calendar', icon: <CalendarMonthRounded />, mobile: true },
  { label: 'Aufgaben', path: '/tasks', icon: <ChecklistRounded />, mobile: true },
  { label: 'Familie', path: '/family', icon: <FamilyRestroomRounded />, mobile: true },
  { label: 'Administration', path: '/admin', icon: <SettingsRounded />, mobile: false, roles: ['ADMIN'] }
];
