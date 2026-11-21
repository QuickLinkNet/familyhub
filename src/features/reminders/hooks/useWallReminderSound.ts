import { useEffect } from 'react';
import type { ReminderBoard } from '../types/reminder';

const storageKey = 'familyhub.wall-reminder-sounds';

function rememberedFingerprints(): string[] {
  try {
    const value = JSON.parse(window.sessionStorage.getItem(storageKey) ?? '[]');
    return Array.isArray(value) ? value.filter(item => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

function remember(fingerprints: string[]) {
  try { window.sessionStorage.setItem(storageKey, JSON.stringify(fingerprints.slice(-80))); }
  catch { /* The reminder remains visible when session storage is unavailable. */ }
}

async function playGentleChime() {
  const context = new AudioContext();
  const gain = context.createGain();
  gain.connect(context.destination);
  gain.gain.setValueAtTime(0.0001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.035, context.currentTime + 0.04);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.65);
  [659.25, 783.99].forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    oscillator.connect(gain);
    oscillator.start(context.currentTime + index * 0.16);
    oscillator.stop(context.currentTime + 0.48 + index * 0.16);
  });
  window.setTimeout(() => { void context.close(); }, 750);
}

export function useWallReminderSound(board: ReminderBoard | undefined, enabled: boolean) {
  useEffect(() => {
    if (!enabled || !board || document.visibilityState !== 'visible') return;
    const audible = board.items.filter(item => item.type === 'EVENT' && item.boardSound);
    if (audible.length === 0) return;
    const remembered = rememberedFingerprints();
    const known = new Set(remembered);
    const fresh = audible.map(item => `${item.id}:${item.dueAt}`).filter(fingerprint => !known.has(fingerprint));
    if (fresh.length === 0) return;
    remember([...remembered, ...fresh]);
    void playGentleChime().catch(() => { /* Autoplay policy may require prior board interaction. */ });
  }, [board, enabled]);
}
