import { useCallback, useEffect, useRef, useState } from 'react';

export type ScreenWakeLockStatus = 'off' | 'unsupported' | 'requesting' | 'active' | 'paused' | 'blocked';

export const supportsScreenWakeLock = () => 'wakeLock' in navigator && window.isSecureContext;

export function useScreenWakeLock(enabled: boolean) {
  const sentinel = useRef<WakeLockSentinel | null>(null);
  const mounted = useRef(true);
  const requestGeneration = useRef(0);
  const [status, setStatus] = useState<ScreenWakeLockStatus>(() => enabled ? 'requesting' : 'off');

  const request = useCallback(async () => {
    if (!enabled) {
      setStatus('off');
      return;
    }
    const wakeLock = 'wakeLock' in navigator ? navigator.wakeLock : null;
    if (!wakeLock || !window.isSecureContext) {
      setStatus('unsupported');
      return;
    }
    if (document.visibilityState !== 'visible') {
      setStatus('paused');
      return;
    }

    try {
      const generation = ++requestGeneration.current;
      setStatus('requesting');
      const acquired = await wakeLock.request('screen');
      if (!mounted.current || generation !== requestGeneration.current) {
        await acquired.release();
        return;
      }
      sentinel.current = acquired;
      setStatus('active');
      acquired.addEventListener('release', () => {
        sentinel.current = null;
        if (mounted.current) setStatus(document.visibilityState === 'visible' ? 'blocked' : 'paused');
      }, { once: true });
    } catch {
      setStatus('blocked');
    }
  }, [enabled]);

  useEffect(() => {
    mounted.current = true;
    void request();
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') void request();
      else setStatus(enabled ? 'paused' : 'off');
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      mounted.current = false;
      requestGeneration.current += 1;
      document.removeEventListener('visibilitychange', handleVisibility);
      const activeSentinel = sentinel.current;
      sentinel.current = null;
      if (activeSentinel && !activeSentinel.released) void activeSentinel.release();
    };
  }, [enabled, request]);

  return { status, retry: request };
}
