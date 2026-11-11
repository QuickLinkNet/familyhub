import type { ReminderItem } from '../types/reminder';
import type { StoredNotificationState } from '../types/browserNotification';

const prefix = 'familyhub:browser-notifications:';
const emptyState: StoredNotificationState = { enabled: false, lastNotifiedAt: null, notified: {} };

export const reminderFingerprint = (item: ReminderItem) => `${item.id}:${item.urgency}:${item.dueAt}`;

export function readNotificationState(memberId: string): StoredNotificationState {
  try {
    const parsed = JSON.parse(localStorage.getItem(prefix + memberId) ?? '') as Partial<StoredNotificationState>;
    return {
      enabled: parsed.enabled === true,
      lastNotifiedAt: typeof parsed.lastNotifiedAt === 'string' ? parsed.lastNotifiedAt : null,
      notified: parsed.notified && typeof parsed.notified === 'object' ? parsed.notified : {}
    };
  } catch {
    return { ...emptyState, notified: {} };
  }
}

export function writeNotificationState(memberId: string, state: StoredNotificationState): void {
  const cutoff = Date.now() - 172_800_000;
  const notified = Object.fromEntries(Object.entries(state.notified).filter(([, timestamp]) => new Date(timestamp).getTime() >= cutoff));
  localStorage.setItem(prefix + memberId, JSON.stringify({ ...state, notified }));
}

export function rememberItems(memberId: string, items: ReminderItem[], notifiedAt = new Date()): void {
  const state = readNotificationState(memberId);
  const timestamp = notifiedAt.toISOString();
  for (const item of items) state.notified[reminderFingerprint(item)] = timestamp;
  writeNotificationState(memberId, { ...state, lastNotifiedAt: timestamp });
}
