import { RestoreRounded, WarningAmberRounded } from '@mui/icons-material';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import type { BackupFile } from '../types/backup';

type Props = {
  open: boolean;
  backup?: BackupFile;
  file?: File;
  pending: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: () => void;
};

export function BackupRestoreDialog({ open, backup, file, pending, error, onClose, onConfirm }: Props) {
  const [confirmation, setConfirmation] = useState('');
  useEffect(() => { if (!open) setConfirmation(''); }, [open]);
  const source = backup ? new Date(backup.createdAt).toLocaleString('de-DE') : file?.name;

  return (
    <Dialog open={open} onClose={pending ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <WarningAmberRounded color="warning" /> Daten wiederherstellen
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} pt={0.5}>
          <Alert severity="warning">
            Der aktuelle Datenstand wird zuerst automatisch gesichert und danach vollständig durch diese Sicherung ersetzt.
          </Alert>
          <div>
            <Typography variant="overline" color="text.secondary">Ausgewählte Sicherung</Typography>
            <Typography fontWeight={700}>{source}</Typography>
          </div>
          <Typography color="text.secondary">
            Kalender-Verbindungen und verschlüsselte Zugangsdaten funktionieren auf derselben Installation weiter. Für einen Serverumzug müssen die Schlüsseldateien aus dem Speicherbereich zusätzlich sicher übernommen werden.
          </Typography>
          <TextField
            label="Zur Bestätigung WIEDERHERSTELLEN eingeben"
            value={confirmation}
            onChange={event => setConfirmation(event.target.value)}
            autoComplete="off"
            fullWidth
          />
          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} disabled={pending}>Abbrechen</Button>
        <Button color="warning" variant="contained" startIcon={<RestoreRounded />} onClick={onConfirm} disabled={pending || confirmation !== 'WIEDERHERSTELLEN'}>
          {pending ? 'Wird vorbereitet …' : 'Jetzt wiederherstellen'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
