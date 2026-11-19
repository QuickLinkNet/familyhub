import type { DashboardCardId, WallCardId } from '../types/profilePreferences';

export type PreferenceOption<T extends string> = { id: T; label: string; description: string };

export const dashboardCardOptions: PreferenceOption<DashboardCardId>[] = [
  { id: 'REMINDERS', label: 'Familienradar', description: 'Dringende Hinweise für dich' },
  { id: 'TODAY', label: 'Heute', description: 'Termine des Tages' },
  { id: 'TASKS', label: 'Aufgaben', description: 'Offen und erledigt' },
  { id: 'FAMILY', label: 'Familie', description: 'Aktive Profile' },
  { id: 'REWARDS', label: 'Schätze', description: 'Dein Punktestand' },
  { id: 'SHOPPING', label: 'Einkauf', description: 'Offene Artikel' },
  { id: 'MEALS', label: 'Essensplan', description: 'Heutige Mahlzeiten' },
  { id: 'NOTES', label: 'Pinnwand', description: 'Aktuelle Familiennotizen' },
  { id: 'SCHOOL', label: 'Schule', description: 'Unterricht und Abgaben' },
  { id: 'HOUSEHOLD', label: 'Haushalt', description: 'Routinen und Aufgaben' },
  { id: 'GOALS', label: 'Familienziele', description: 'Gemeinsamer Fortschritt' },
  { id: 'WALL_MODE', label: 'Wandmodus', description: 'Direkter Start des Boards' },
  { id: 'ADMIN_SETUP', label: 'Systemstatus', description: 'Einrichtung für Admins' },
];

export const wallCardOptions: PreferenceOption<WallCardId>[] = [
  { id: 'EVENTS', label: 'Termine', description: 'Die nächsten sieben Tage' },
  { id: 'TASKS', label: 'Aufgaben', description: 'Was gerade ansteht' },
  { id: 'REMINDERS', label: 'Familienradar', description: 'Wichtige Hinweise' },
  { id: 'GOALS', label: 'Familienziel', description: 'Aktuelles gemeinsames Ziel' },
  { id: 'NOTES', label: 'Pinnwand', description: 'Sichtbare Familiennotizen' },
  { id: 'SCHOOL', label: 'Schule', description: 'Unterricht und Abgaben' },
  { id: 'FAMILY', label: 'Familie', description: 'Wer zum Haushalt gehört' },
];

export const defaultDashboardCards = dashboardCardOptions.map(option => option.id);
export const defaultWallCards = wallCardOptions.map(option => option.id);
