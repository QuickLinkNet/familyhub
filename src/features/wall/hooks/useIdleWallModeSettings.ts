import { useCallback, useEffect, useState } from 'react';
import {
  idleWallModeChangedEvent,
  readIdleWallModeSettings,
  writeIdleWallModeSettings,
  type IdleWallModeSettings
} from '../services/idleWallModeStore';

export function useIdleWallModeSettings() {
  const [settings, setSettings] = useState(readIdleWallModeSettings);

  useEffect(() => {
    const refresh = () => setSettings(readIdleWallModeSettings());
    window.addEventListener('storage', refresh);
    window.addEventListener(idleWallModeChangedEvent, refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener(idleWallModeChangedEvent, refresh);
    };
  }, []);

  const saveSettings = useCallback((next: IdleWallModeSettings) => {
    writeIdleWallModeSettings(next);
    setSettings(next);
  }, []);

  return { settings, saveSettings };
}
