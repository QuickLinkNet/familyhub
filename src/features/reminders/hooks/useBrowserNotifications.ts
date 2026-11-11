import { useCallback, useEffect, useState } from 'react';
import { markCurrentItemsAsSeen, notifyNewReminders, showNotificationTest, supportsBrowserNotifications } from '../services/browserNotificationService';
import { readNotificationState, writeNotificationState } from '../services/browserNotificationStore';
import type { BrowserNotificationStatus } from '../types/browserNotification';
import type { ReminderBoard } from '../types/reminder';

const initialStatus = (): BrowserNotificationStatus => {
  const supported = supportsBrowserNotifications();
  return { supported, permission: supported ? Notification.permission : 'unsupported', enabled: false };
};

export function useBrowserNotifications(board?: ReminderBoard) {
  const [status, setStatus] = useState<BrowserNotificationStatus>(initialStatus);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!board) return;
    const stored = readNotificationState(board.audience.id);
    setStatus(current => {
      const permission = current.supported ? Notification.permission : 'unsupported';
      return { ...current, permission, enabled: current.supported && stored.enabled && permission === 'granted' };
    });
  }, [board]);

  const enable = useCallback(async () => {
    if (!board || !supportsBrowserNotifications()) return;
    setError(null);
    try {
      const permission = Notification.permission === 'default' ? await Notification.requestPermission() : Notification.permission;
      if (permission !== 'granted') {
        setStatus({ supported: true, permission, enabled: false });
        return;
      }
      const stored = readNotificationState(board.audience.id);
      writeNotificationState(board.audience.id, { ...stored, enabled: true });
      markCurrentItemsAsSeen(board);
      setStatus({ supported: true, permission, enabled: true });
      await showNotificationTest();
    } catch {
      setError('Die Testbenachrichtigung konnte nicht angezeigt werden.');
    }
  }, [board]);

  const disable = useCallback(() => {
    if (!board) return;
    const stored = readNotificationState(board.audience.id);
    writeNotificationState(board.audience.id, { ...stored, enabled: false });
    setStatus(current => ({ ...current, enabled: false }));
  }, [board]);

  const test = useCallback(async () => {
    setError(null);
    try { await showNotificationTest(); }
    catch { setError('Die Testbenachrichtigung konnte nicht angezeigt werden.'); }
  }, []);

  useEffect(() => {
    if (!board || !status.enabled) return;
    const run = () => { void notifyNewReminders(board).catch(() => setError('Eine Browser-Benachrichtigung konnte nicht angezeigt werden.')); };
    run();
    document.addEventListener('visibilitychange', run);
    return () => document.removeEventListener('visibilitychange', run);
  }, [board, status.enabled]);

  return { status, error, enable, disable, test };
}
