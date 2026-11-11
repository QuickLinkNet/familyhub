import type { ReminderBoard, ReminderItem } from '../types/reminder';
import { readNotificationState, rememberItems, reminderFingerprint } from './browserNotificationStore';

const cooldownMs = 30 * 60 * 1000;
let dispatchPromise: Promise<boolean> | null = null;

export const supportsBrowserNotifications = () => 'Notification' in window && 'serviceWorker' in navigator;

async function showNotification(title: string, body: string, href: string, tag: string): Promise<void> {
  const registration = await Promise.race([
    navigator.serviceWorker.ready,
    new Promise<never>((_, reject) => window.setTimeout(() => reject(new Error('Service worker unavailable')), 8_000))
  ]);
  const icon = new URL(`${import.meta.env.BASE_URL}icon-192.svg`, window.location.origin).toString();
  await registration.showNotification(title, {
    body,
    icon,
    badge: icon,
    tag,
    data: { href }
  });
}

export async function showNotificationTest(): Promise<void> {
  await showNotification('FamilyHub ist bereit', 'Wichtige Familientermine und Aufgaben können dich jetzt ruhig erinnern.', '/', 'familyhub-test');
}

const relevantItems = (board: ReminderBoard) => board.items.filter(item => item.urgency === 'CRITICAL' || item.urgency === 'ATTENTION');

export function markCurrentItemsAsSeen(board: ReminderBoard): void {
  const items = relevantItems(board);
  if (items.length > 0) rememberItems(board.audience.id, items);
}

async function dispatchNewReminders(board: ReminderBoard): Promise<boolean> {
  if (!supportsBrowserNotifications() || Notification.permission !== 'granted' || document.visibilityState === 'visible') return false;
  const state = readNotificationState(board.audience.id);
  if (!state.enabled) return false;
  const fresh = relevantItems(board).filter(item => !(reminderFingerprint(item) in state.notified));
  if (fresh.length === 0) return false;
  const hasCritical = fresh.some(item => item.urgency === 'CRITICAL');
  const last = state.lastNotifiedAt ? new Date(state.lastNotifiedAt).getTime() : 0;
  if (!hasCritical && Date.now() - last < cooldownMs) return false;
  const first = fresh[0] as ReminderItem;
  const title = fresh.length === 1 ? first.title : `${fresh.length} Dinge brauchen Aufmerksamkeit`;
  const body = fresh.length === 1 ? first.message : `${first.title} und ${fresh.length - 1} weitere Hinweise`;
  await showNotification(title, body, first.action.href, 'familyhub-reminders');
  rememberItems(board.audience.id, fresh);
  return true;
}

export function notifyNewReminders(board: ReminderBoard): Promise<boolean> {
  if (dispatchPromise) return dispatchPromise;
  dispatchPromise = dispatchNewReminders(board).finally(() => { dispatchPromise = null; });
  return dispatchPromise;
}
