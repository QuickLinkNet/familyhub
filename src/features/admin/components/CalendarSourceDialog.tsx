import { useState, type FormEvent } from 'react';
import { LaunchRounded, LockRounded } from '@mui/icons-material';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, InputAdornment, Link, Stack, Switch, TextField, Typography } from '@mui/material';
import { memberColors } from '../../../theme/memberPalette';
import type { CalendarSource, CalendarSourceInput } from '../types/calendarSource';

interface CalendarSourceDialogProps {
  source: CalendarSource | null;
  pending: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (input: CalendarSourceInput) => Promise<void>;
}

export function CalendarSourceDialog({ source, pending, error, onClose, onSave }: CalendarSourceDialogProps) {
  const [name, setName] = useState(source?.name ?? 'Google Kalender');
  const [url, setUrl] = useState('');
  const [color, setColor] = useState(source?.color ?? '#6C8AB8');
  const [isActive, setIsActive] = useState(source?.isActive ?? true);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSave({ name, color, isActive, ...(url.trim() === '' ? {} : { url: url.trim() }) });
  };
  const publicAddressDetected = url.includes('/public/basic.ics');

  return (
    <Dialog open onClose={pending ? undefined : onClose} fullWidth maxWidth="sm" PaperProps={{ component: 'form', onSubmit: submit }}>
      <DialogTitle>{source ? 'Google-Kalender bearbeiten' : 'Google-Kalender verbinden'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} pt={1}>
          {error && <Alert severity="error">{error}</Alert>}
          <Alert severity="info">
            In Google Kalender am Computer: Einstellungen → gewünschten Kalender → „Kalender integrieren“ → <strong>„Geheime Adresse im iCal-Format“</strong> kopieren.{' '}
            <Link href="https://support.google.com/calendar/answer/37648?hl=de" target="_blank" rel="noreferrer" underline="hover">Google-Anleitung <LaunchRounded sx={{ fontSize: 14, verticalAlign: 'middle' }} /></Link>
          </Alert>
          <TextField required autoFocus label="Anzeigename" value={name} onChange={event => setName(event.target.value)} inputProps={{ maxLength: 80 }} />
          <TextField
            required={!source}
            label={source ? 'Neue iCal-Adresse (optional)' : 'Geheime iCal-Adresse'}
            type="url"
            value={url}
            onChange={event => setUrl(event.target.value)}
            placeholder="https://calendar.google.com/calendar/ical/…/basic.ics"
            helperText={source ? 'Leer lassen, um die sicher gespeicherte Adresse beizubehalten.' : 'FamilyHub prüft den Link zuerst. Erst bei Erfolg wird er verschlüsselt gespeichert.'}
            autoComplete="url"
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><LockRounded fontSize="small" /></InputAdornment> } }}
          />
          {publicAddressDetected && <Alert severity="warning">Das ist die öffentliche iCal-Adresse. Sie funktioniert nur bei öffentlich freigegebenen Kalendern. Empfohlen ist die private beziehungsweise geheime Adresse direkt darunter.</Alert>}
          <Box>
            <Typography variant="subtitle2" mb={1}>Kalenderfarbe</Typography>
            <Stack direction="row" gap={1} flexWrap="wrap">
              {memberColors.map(option => (
                <Button key={option} aria-label={`Farbe ${option}`} onClick={() => setColor(option)} sx={{ minWidth: 44, width: 44, height: 44, borderRadius: '50%', bgcolor: option, border: color === option ? '4px solid white' : '2px solid transparent', outline: color === option ? `3px solid ${option}` : 'none', '&:hover': { bgcolor: option } }} />
              ))}
            </Stack>
          </Box>
          <FormControlLabel control={<Switch checked={isActive} onChange={event => setIsActive(event.target.checked)} />} label="Im Familienkalender anzeigen" />
          <Typography variant="body2" color="text.secondary">Die Verbindung ist ausschließlich lesend. Änderungen erfolgen weiterhin in Google Kalender.</Typography>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2.5, pt: 1.5 }}>
        <Button onClick={onClose} disabled={pending}>Abbrechen</Button>
        <Button type="submit" variant="contained" disabled={pending}>{pending ? 'Prüft Verbindung …' : source ? (url.trim() === '' ? 'Änderungen speichern' : 'Prüfen & aktualisieren') : 'Prüfen & verbinden'}</Button>
      </DialogActions>
    </Dialog>
  );
}
