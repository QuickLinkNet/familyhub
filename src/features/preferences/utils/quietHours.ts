import type { ProfilePreferences } from '../types/profilePreferences';

export function isQuietHoursActive(preferences: ProfilePreferences, reference = new Date()): boolean {
  if (!preferences.quietHoursEnabled) return false;
  const time = `${String(reference.getHours()).padStart(2, '0')}:${String(reference.getMinutes()).padStart(2, '0')}`;
  const { quietHoursStart: start, quietHoursEnd: end } = preferences;
  return start < end ? time >= start && time < end : time >= start || time < end;
}
