import { useEffect, useState } from 'react';
import { DashboardCustomizeRounded, NotificationsPausedRounded, TvRounded } from '@mui/icons-material';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControlLabel, Stack, Switch, TextField, Typography } from '@mui/material';
import { dashboardCardOptions, defaultDashboardCards, defaultWallCards, wallCardOptions } from '../constants/profilePreferences';
import { useProfilePreferences, useUpdateProfilePreferences } from '../hooks/useProfilePreferences';
import type { ProfilePreferences } from '../types/profilePreferences';
import { PreferenceToggleGrid } from './PreferenceToggleGrid';

type Props = { open: boolean; onClose: () => void };

const defaults: ProfilePreferences = {
  dashboardCards: defaultDashboardCards,
  wallCards: defaultWallCards,
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
};

export function PersonalizationDialog({ open, onClose }: Props) {
  const preferences = useProfilePreferences();
  const update = useUpdateProfilePreferences();
  const [draft, setDraft] = useState<ProfilePreferences>(defaults);
  useEffect(() => { if (open) setDraft(preferences.data ?? defaults); }, [open, preferences.data]);
  const timesValid = draft.quietHoursStart !== draft.quietHoursEnd;
  const save = () => update.mutate(draft, { onSuccess: onClose });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}><DashboardCustomizeRounded color="primary" /> Ansicht & Ruhezeiten</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} pt={1}>
          <Typography color="text.secondary">Passe FamilyHub für dein Profil an. Die Auswahl gilt auf allen deinen Geräten und ändert keine Daten anderer Familienmitglieder.</Typography>
          {preferences.isError && <Alert severity="error">Deine Einstellungen konnten nicht geladen werden.</Alert>}
          <Stack spacing={1.25}>
            <Stack direction="row" gap={1} alignItems="center"><DashboardCustomizeRounded color="action" /><Typography variant="h6">Meine Übersicht</Typography></Stack>
            <PreferenceToggleGrid options={dashboardCardOptions} selected={draft.dashboardCards} onChange={dashboardCards => setDraft(current => ({ ...current, dashboardCards }))} />
          </Stack>
          <Divider />
          <Stack spacing={1.25}>
            <Stack direction="row" gap={1} alignItems="center"><TvRounded color="action" /><Typography variant="h6">Wandmodus</Typography></Stack>
            <PreferenceToggleGrid options={wallCardOptions} selected={draft.wallCards} onChange={wallCards => setDraft(current => ({ ...current, wallCards }))} />
          </Stack>
          <Divider />
          <Stack spacing={1.5}>
            <Stack direction="row" gap={1} alignItems="center"><NotificationsPausedRounded color="action" /><Typography variant="h6">Benachrichtigungs-Ruhezeit</Typography></Stack>
            <FormControlLabel control={<Switch checked={draft.quietHoursEnabled} onChange={event => setDraft(current => ({ ...current, quietHoursEnabled: event.target.checked }))} />} label="Push-Nachrichten während meiner Ruhezeit pausieren" />
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
              <TextField type="time" label="Ruhezeit ab" value={draft.quietHoursStart} disabled={!draft.quietHoursEnabled} slotProps={{ inputLabel: { shrink: true } }} onChange={event => setDraft(current => ({ ...current, quietHoursStart: event.target.value }))} />
              <TextField type="time" label="Ruhezeit bis" value={draft.quietHoursEnd} disabled={!draft.quietHoursEnabled} slotProps={{ inputLabel: { shrink: true } }} onChange={event => setDraft(current => ({ ...current, quietHoursEnd: event.target.value }))} />
            </Box>
            {!timesValid && <Alert severity="error">Beginn und Ende müssen unterschiedlich sein.</Alert>}
            <Alert severity="info">Hinweise bleiben in FamilyHub sichtbar. Nur automatische Browser- und Push-Nachrichten pausieren.</Alert>
          </Stack>
          {update.isError && <Alert severity="error">Die Einstellungen konnten nicht gespeichert werden.</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose}>Abbrechen</Button>
        <Button variant="contained" disabled={!timesValid || preferences.isLoading || update.isPending} onClick={save}>{update.isPending ? 'Speichert …' : 'Für mein Profil speichern'}</Button>
      </DialogActions>
    </Dialog>
  );
}
