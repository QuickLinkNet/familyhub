import type { ReactNode } from 'react';
import { CalendarMonthRounded, ChecklistRounded, DashboardRounded, FamilyRestroomRounded, ShoppingBasketRounded } from '@mui/icons-material';

export interface NavigationItem {
  label: string;
  path: string;
  icon: ReactNode;
  mobile: boolean;
}

export const navigationItems: NavigationItem[] = [
  { label: 'Übersicht', path: '/', icon: <DashboardRounded />, mobile: true },
  { label: 'Kalender', path: '/calendar', icon: <CalendarMonthRounded />, mobile: true },
  { label: 'Aufgaben', path: '/tasks', icon: <ChecklistRounded />, mobile: true },
  { label: 'Familie', path: '/family', icon: <FamilyRestroomRounded />, mobile: true },
  { label: 'Einkauf', path: '/shopping', icon: <ShoppingBasketRounded />, mobile: false }
];
