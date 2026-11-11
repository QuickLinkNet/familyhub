import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { idleWallReturnPathKey } from '../services/idleWallModeStore';
import { useIdleWallModeSettings } from './useIdleWallModeSettings';

const activityEvents: Array<keyof WindowEventMap> = ['pointerdown', 'keydown', 'touchstart', 'scroll'];

function hasActiveInteraction() {
  if (document.visibilityState !== 'visible') return true;
  if (document.querySelector('.MuiModal-root, [role="dialog"], [role="menu"], [role="listbox"]')) return true;

  const active = document.activeElement;
  if (!(active instanceof HTMLElement)) return false;
  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(active.tagName) || active.isContentEditable;
}

function timeoutInMilliseconds(minutes: number, search: string) {
  if (import.meta.env.DEV) {
    const qaTimeout = Number(new URLSearchParams(search).get('idleQaMs'));
    if (Number.isFinite(qaTimeout) && qaTimeout >= 250) return qaTimeout;
  }
  return minutes * 60_000;
}

export function useIdleWallMode() {
  const { settings } = useIdleWallModeSettings();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!settings.enabled) return;

    let timer = 0;
    const startTimer = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (hasActiveInteraction()) {
          startTimer();
          return;
        }

        sessionStorage.setItem(idleWallReturnPathKey, `${location.pathname}${location.search}`);
        navigate('/wall?source=idle', { replace: true });
      }, timeoutInMilliseconds(settings.timeoutMinutes, location.search));
    };
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') startTimer();
      else window.clearTimeout(timer);
    };

    activityEvents.forEach(event => window.addEventListener(event, startTimer, { passive: true }));
    document.addEventListener('visibilitychange', handleVisibility);
    startTimer();

    return () => {
      window.clearTimeout(timer);
      activityEvents.forEach(event => window.removeEventListener(event, startTimer));
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [location.pathname, location.search, navigate, settings.enabled, settings.timeoutMinutes]);
}
