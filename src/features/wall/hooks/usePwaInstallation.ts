import { useCallback, useEffect, useMemo, useState } from 'react';

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface InstallPromptRegistry {
  prompt: InstallPromptEvent | null;
  installed: boolean;
  subscribers: Set<() => void>;
}

declare global {
  interface Window { __familyHubInstallPrompt?: InstallPromptRegistry }
}

function isStandaloneMode() {
  const iosNavigator = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia('(display-mode: standalone)').matches || iosNavigator.standalone === true;
}

function createRegistry(): InstallPromptRegistry {
  const existing = window.__familyHubInstallPrompt;
  if (existing) return existing;

  const registry: InstallPromptRegistry = {
    prompt: null,
    installed: isStandaloneMode(),
    subscribers: new Set()
  };
  window.__familyHubInstallPrompt = registry;
  const notify = () => registry.subscribers.forEach(subscriber => subscriber());
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    registry.prompt = event as InstallPromptEvent;
    notify();
  });
  window.addEventListener('appinstalled', () => {
    registry.installed = true;
    registry.prompt = null;
    notify();
  });
  return registry;
}

const installRegistry = createRegistry();

function installationHint() {
  const agent = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(agent)) return 'In Safari „Teilen“ öffnen und „Zum Home-Bildschirm“ wählen.';
  if (/Android/.test(agent)) return 'Im Browsermenü „App installieren“ oder „Zum Startbildschirm hinzufügen“ wählen.';
  if (/Edg\//.test(agent)) return 'Im Edge-Menü „Apps“ und danach „Diese Website als App installieren“ wählen.';
  return 'Im Browsermenü „App installieren“ oder das Installationssymbol in der Adresszeile wählen.';
}

export function usePwaInstallation() {
  const [promptEvent, setPromptEvent] = useState(installRegistry.prompt);
  const [installed, setInstalled] = useState(installRegistry.installed);

  useEffect(() => {
    const displayMode = window.matchMedia('(display-mode: standalone)');
    const refresh = () => {
      setPromptEvent(installRegistry.prompt);
      setInstalled(installRegistry.installed || isStandaloneMode());
    };
    const handleDisplayMode = () => {
      installRegistry.installed = isStandaloneMode();
      refresh();
    };

    installRegistry.subscribers.add(refresh);
    displayMode.addEventListener('change', handleDisplayMode);
    return () => {
      installRegistry.subscribers.delete(refresh);
      displayMode.removeEventListener('change', handleDisplayMode);
    };
  }, []);

  const install = useCallback(async () => {
    if (!promptEvent) return false;
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    if (choice.outcome === 'accepted') {
      installRegistry.prompt = null;
      setPromptEvent(null);
    }
    return choice.outcome === 'accepted';
  }, [promptEvent]);

  return useMemo(() => ({
    installed,
    canInstall: Boolean(promptEvent),
    install,
    hint: installationHint()
  }), [install, installed, promptEvent]);
}
