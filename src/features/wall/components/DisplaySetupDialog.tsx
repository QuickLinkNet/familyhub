import { useEffect, useState } from 'react';
import {
  AccessTimeRounded, AddToHomeScreenRounded, InstallDesktopRounded, LightModeRounded,
  PlayArrowRounded, TimerRounded, TvRounded
} from '@mui/icons-material';
import {
  Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider,
  FormControl, FormControlLabel, InputLabel, MenuItem, Select, Stack, Switch, Typography
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useIdleWallModeSettings } from '../hooks/useIdleWallModeSettings';
import { usePwaInstallation } from '../hooks/usePwaInstallation';
import { supportsScreenWakeLock } from '../hooks/useScreenWakeLock';
import {
  idleWallModeTimeouts, idleWallReturnPathKey, type IdleWallModeSettings
} from '../services/idleWallModeStore';
import { DisplaySetupStatusCard } from './DisplaySetupStatusCard';

interface DisplaySetupDialogProps {
  open: boolean;
  onClose: () => void;
}

export function DisplaySetupDialog({ open, onClose }: DisplaySetupDialogProps) {
  const { settings, saveSettings } = useIdleWallModeSettings();
  const pwa = usePwaInstallation();
  const wakeLockAvailable = supportsScreenWakeLock();
  const [draft, setDraft] = useState<IdleWallModeSettings>(settings);
  const [installing, setInstalling] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (open) setDraft(settings);
  }, [open, settings]);

  const save = () => {
    saveSettings(draft);
    onClose();
  };
  const testWallMode = () => {
    saveSettings(draft);
    sessionStorage.setItem(idleWallReturnPathKey, `${location.pathname}${location.search}`);
    onClose();
    navigate('/wall?source=setup');
  };
  const install = async () => {
    setInstalling(true);
    try { await pwa.install(); } finally { setInstalling(false); }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
        <TvRounded color="primary" /> Familienboard einrichten
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} pt={1}>
          <Typography color="text.secondary">
            Richte dieses Gerät als ruhiges Familienboard ein. Alle Einstellungen gelten nur für diesen Browser.
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 1.25 }}>
            <DisplaySetupStatusCard
              icon={<InstallDesktopRounded color="primary" />}
              label="App-Modus"
              value={pwa.installed ? 'Installiert' : pwa.canInstall ? 'Installierbar' : 'Im Browser'}
              tone={pwa.installed ? 'success' : 'info'}
            />
            <DisplaySetupStatusCard
              icon={<LightModeRounded color="primary" />}
              label="Bildschirm"
              value={wakeLockAvailable ? 'Wachhalten möglich' : 'Browser begrenzt'}
              tone={wakeLockAvailable ? 'success' : 'warning'}
            />
            <DisplaySetupStatusCard
              icon={<TimerRounded color="primary" />}
              label="Automatik"
              value={draft.enabled ? `Nach ${draft.timeoutMinutes} Min.` : 'Ausgeschaltet'}
              tone={draft.enabled ? 'success' : 'info'}
            />
          </Box>

          <Stack spacing={1.25}>
            <Typography variant="h6">1. Wie eine App öffnen</Typography>
            {pwa.installed
              ? <Alert severity="success">Familienkompass läuft bereits im installierten App-Modus.</Alert>
              : <Alert severity="info" icon={<AddToHomeScreenRounded />}>{pwa.hint}</Alert>}
            {pwa.canInstall && !pwa.installed && (
              <Button variant="outlined" startIcon={<InstallDesktopRounded />} disabled={installing} onClick={() => void install()} sx={{ alignSelf: 'flex-start' }}>
                {installing ? 'Installation wird geöffnet …' : 'Familienkompass installieren'}
              </Button>
            )}
          </Stack>

          <Divider />
          <Stack spacing={1.5}>
            <Typography variant="h6">2. Display-Verhalten</Typography>
            <FormControlLabel
              control={<Switch checked={draft.keepScreenAwake} disabled={!wakeLockAvailable} onChange={event => setDraft(current => ({ ...current, keepScreenAwake: event.target.checked }))} />}
              label="Bildschirm im Wandmodus eingeschaltet lassen"
            />
            {!wakeLockAvailable && <Alert severity="warning">Dieser Browser unterstützt das sichere Bildschirm-Wachhalten nicht. Die System-Energieeinstellungen bleiben weiterhin wirksam.</Alert>}
            <FormControlLabel
              control={<Switch checked={draft.enabled} onChange={event => setDraft(current => ({ ...current, enabled: event.target.checked }))} />}
              label="Nach Ruhezeit automatisch zum Wandmodus wechseln"
            />
            <FormControl fullWidth disabled={!draft.enabled}>
              <InputLabel id="idle-wall-timeout-label">Ruhezeit</InputLabel>
              <Select
                labelId="idle-wall-timeout-label"
                label="Ruhezeit"
                value={draft.timeoutMinutes}
                startAdornment={<AccessTimeRounded color="action" sx={{ mr: 1 }} />}
                onChange={event => setDraft(current => ({ ...current, timeoutMinutes: Number(event.target.value) }))}
              >
                {idleWallModeTimeouts.map(minutes => (
                  <MenuItem key={minutes} value={minutes}>Nach {minutes} {minutes === 1 ? 'Minute' : 'Minuten'}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          <Alert severity="info">
            Vollbild benötigt einmalig eine bewusste Berührung. Offene Dialoge und Eingaben pausieren den automatischen Wechsel.
          </Alert>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 0.5, flexWrap: 'wrap' }}>
        <Button onClick={onClose}>Abbrechen</Button>
        <Button startIcon={<PlayArrowRounded />} onClick={testWallMode}>Wandmodus testen</Button>
        <Button variant="contained" onClick={save}>Auf diesem Gerät speichern</Button>
      </DialogActions>
    </Dialog>
  );
}
