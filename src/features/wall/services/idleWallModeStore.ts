export interface IdleWallModeSettings {
  enabled: boolean;
  timeoutMinutes: number;
  keepScreenAwake: boolean;
}

export const idleWallModeTimeouts = [1, 2, 5, 10, 15, 30] as const;
export const idleWallModeChangedEvent = 'familyhub:idle-wall-mode-changed';
export const idleWallReturnPathKey = 'familyhub:idle-wall-mode:return-path';

const storageKey = 'familyhub:idle-wall-mode';
const defaultSettings: IdleWallModeSettings = { enabled: false, timeoutMinutes: 5, keepScreenAwake: false };

export function readIdleWallModeSettings(): IdleWallModeSettings {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) ?? '') as Partial<IdleWallModeSettings>;
    const timeoutMinutes = idleWallModeTimeouts.includes(stored.timeoutMinutes as typeof idleWallModeTimeouts[number])
      ? stored.timeoutMinutes as number
      : defaultSettings.timeoutMinutes;

    return { enabled: stored.enabled === true, timeoutMinutes, keepScreenAwake: stored.keepScreenAwake === true };
  } catch {
    return defaultSettings;
  }
}

export function writeIdleWallModeSettings(settings: IdleWallModeSettings) {
  localStorage.setItem(storageKey, JSON.stringify(settings));
  window.dispatchEvent(new CustomEvent(idleWallModeChangedEvent));
}

export function isSafeWallReturnPath(path: string | null): path is string {
  return Boolean(path && path.startsWith('/') && !path.startsWith('//') && !path.startsWith('/wall'));
}
