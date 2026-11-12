import { useCallback, useEffect, useState } from 'react';
import { markCurrentItemsAsSeen, notifyNewReminders, supportsBrowserNotifications } from '../services/browserNotificationService';
import { readNotificationState, writeNotificationState } from '../services/browserNotificationStore';
import type { BrowserNotificationStatus } from '../types/browserNotification';
import type { ReminderBoard } from '../types/reminder';
import { getPushStatus, registerPushSubscription, removePushSubscription, sendPushTest } from '../api/pushApi';
import type { PushStatus } from '../types/push';

const initialStatus = (): BrowserNotificationStatus => {
  const supported = supportsBrowserNotifications();
  return { supported, permission: supported ? Notification.permission : 'unsupported', enabled: false, deviceCount: 0, loading: supported };
};

const applicationServerKey = (value: string): Uint8Array<ArrayBuffer> => {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - value.length % 4) % 4);
  const binary = window.atob(padded);
  return Uint8Array.from(binary, character => character.charCodeAt(0));
};

const deviceLabel = () => {
  const agent = navigator.userAgent;
  if (/iPad|iPhone|iPod/i.test(agent)) return 'iPhone / iPad';
  if (/Android/i.test(agent)) return 'Android-Gerät';
  if (/Windows/i.test(agent)) return 'Windows-Browser';
  if (/Macintosh/i.test(agent)) return 'Mac-Browser';
  return 'Familiengerät';
};

export function useBrowserNotifications(board?: ReminderBoard) {
  const [status, setStatus] = useState<BrowserNotificationStatus>(initialStatus);
  const [error, setError] = useState<string | null>(null);
  const [server, setServer] = useState<PushStatus | null>(null);

  useEffect(() => {
    if (!board) return;
    if (!supportsBrowserNotifications()) return;
    const controller = new AbortController();
    void getPushStatus(controller.signal)
      .then(async nextServer => {
        let subscription: PushSubscription | null = null;
        if (Notification.permission === 'granted') {
          try {
            const registration = await navigator.serviceWorker.ready;
            subscription = await registration.pushManager.getSubscription();
          } catch { /* A blocked browser permission must not hide the server status. */ }
        }
        if (controller.signal.aborted) return;
        setServer(nextServer);
        const permission = Notification.permission;
        const enabled = permission === 'granted' && subscription !== null;
        const stored = readNotificationState(board.audience.id);
        writeNotificationState(board.audience.id, { ...stored, enabled });
        setStatus({ supported: true, permission, enabled, deviceCount: nextServer.devices.length, loading: false });
      })
      .catch(() => { if (!controller.signal.aborted) { setError('Der Push-Status konnte nicht geladen werden.'); setStatus(current => ({ ...current, loading: false })); } });
    return () => controller.abort();
  }, [board]);

  const enable = useCallback(async () => {
    if (!board || !supportsBrowserNotifications() || !server) return;
    setError(null);
    try {
      const permission = Notification.permission === 'default' ? await Notification.requestPermission() : Notification.permission;
      if (permission !== 'granted') {
        setStatus(current => ({ ...current, permission, enabled: false, loading: false }));
        return;
      }
      const registration = await navigator.serviceWorker.ready;
      const existing = await registration.pushManager.getSubscription();
      const subscription = existing ?? await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: applicationServerKey(server.publicKey) });
      const nextServer = await registerPushSubscription(subscription, deviceLabel());
      setServer(nextServer);
      const stored = readNotificationState(board.audience.id);
      writeNotificationState(board.audience.id, { ...stored, enabled: true });
      markCurrentItemsAsSeen(board);
      setStatus({ supported: true, permission, enabled: true, deviceCount: nextServer.devices.length, loading: false });
      const delivery = await sendPushTest();
      if (delivery.delivered < 1) throw new Error('Push test failed');
    } catch {
      setError('Push konnte auf diesem Gerät nicht vollständig aktiviert werden.');
    }
  }, [board, server]);

  const disable = useCallback(async () => {
    if (!board) return;
    setError(null);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        try { await removePushSubscription(subscription.endpoint); } catch { /* Local cleanup must still succeed. */ }
        await subscription.unsubscribe();
      }
      const stored = readNotificationState(board.audience.id);
      writeNotificationState(board.audience.id, { ...stored, enabled: false });
      const nextServer = await getPushStatus();
      setServer(nextServer);
      setStatus(current => ({ ...current, enabled: false, deviceCount: nextServer.devices.length }));
    } catch { setError('Push konnte auf diesem Gerät nicht ausgeschaltet werden.'); }
  }, [board]);

  const test = useCallback(async () => {
    setError(null);
    try {
      const result = await sendPushTest();
      if (result.delivered < 1) throw new Error('Push test failed');
    } catch { setError('Die verschlüsselte Testnachricht konnte nicht zugestellt werden.'); }
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
