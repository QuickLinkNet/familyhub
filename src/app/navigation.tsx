import type { ReactNode } from 'react';
import { CalendarMonthRounded, CardGiftcardRounded, ChecklistRounded, DashboardRounded, FamilyRestroomRounded, HomeWorkRounded, PushPinRounded, RestaurantMenuRounded, SchoolRounded, SettingsRounded, ShoppingCartRounded, TvRounded } from '@mui/icons-material';
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
  { label: 'Einkauf', path: '/shopping', icon: <ShoppingCartRounded />, mobile: true },
  { label: 'Essensplan', path: '/meals', icon: <RestaurantMenuRounded />, mobile: true },
  { label: 'Pinnwand', path: '/notes', icon: <PushPinRounded />, mobile: false },
  { label: 'Schule', path: '/school', icon: <SchoolRounded />, mobile: false },
  { label: 'Haushalt', path: '/household', icon: <HomeWorkRounded />, mobile: false },
  { label: 'Schätze', path: '/rewards', icon: <CardGiftcardRounded />, mobile: false },
  { label: 'Familie', path: '/family', icon: <FamilyRestroomRounded />, mobile: false },
  { label: 'Administration', path: '/admin', icon: <SettingsRounded />, mobile: false, roles: ['ADMIN'] }
];
