export interface DisplaySchedule {
  scheduleEnabled: boolean;
  activeFrom: string;
  activeUntil: string;
}

const clockTimePattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

export const isValidClockTime = (value: unknown): value is string => typeof value === 'string' && clockTimePattern.test(value);

function minutesSinceMidnight(value: string) {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}

export function isDisplayScheduleActive(now: Date, schedule: DisplaySchedule) {
  if (!schedule.scheduleEnabled) return true;

  const start = minutesSinceMidnight(schedule.activeFrom);
  const end = minutesSinceMidnight(schedule.activeUntil);
  const current = now.getHours() * 60 + now.getMinutes();
  if (start === end) return false;
  if (start < end) return current >= start && current < end;
  return current >= start || current < end;
}

export const displayScheduleLabel = (schedule: DisplaySchedule) => schedule.scheduleEnabled
  ? `${schedule.activeFrom}–${schedule.activeUntil} Uhr`
  : 'Jederzeit aktiv';
