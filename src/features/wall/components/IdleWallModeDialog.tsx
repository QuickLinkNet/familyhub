import { useEffect, useState } from 'react';
import { AccessTimeRounded, TvRounded } from '@mui/icons-material';
import {
  Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl,
  FormControlLabel, InputLabel, MenuItem, Select, Stack, Switch, Typography
} from '@mui/material';
import { useIdleWallModeSettings } from '../hooks/useIdleWallModeSettings';
import { idleWallModeTimeouts, type IdleWallModeSettings } from '../services/idleWallModeStore';

interface IdleWallModeDialogProps {
  open: boolean;
  onClose: () => void;
}

export function IdleWallModeDialog({ open, onClose }: IdleWallModeDialogProps) {
  const { settings, saveSettings } = useIdleWallModeSettings();
  const [draft, setDraft] = useState<IdleWallModeSettings>(settings);

  useEffect(() => {
    if (open) setDraft(settings);
  }, [open, settings]);

  const save = () => {
    saveSettings(draft);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
        <TvRounded color="primary" /> Automatischer Wandmodus
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} pt={1}>
          <Typography color="text.secondary">
            Dieses Gerät wechselt nach einer Ruhezeit selbstständig zur Familienanzeige. Andere Geräte bleiben unverändert.
          </Typography>
          <FormControlLabel
            control={<Switch checked={draft.enabled} onChange={event => setDraft(current => ({ ...current, enabled: event.target.checked }))} />}
            label="Auf diesem Gerät aktivieren"
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
          <Alert severity="info">
            Ein Tipp auf „Zurück zum Familienbereich“ beendet die automatische Anzeige. Vollbild kann der Browser nur nach einer bewussten Berührung erlauben.
          </Alert>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose}>Abbrechen</Button>
        <Button variant="contained" onClick={save}>Auf diesem Gerät speichern</Button>
      </DialogActions>
    </Dialog>
  );
}
