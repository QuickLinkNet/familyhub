import { ArchiveRounded, WarningAmberRounded } from '@mui/icons-material';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

type Props = {
  open: boolean;
  file: File | null;
  pending: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: () => void;
};

const formatSize = (bytes: number) => bytes < 1_048_576 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1_048_576).toFixed(1)} MB`;

export function ArchiveRestoreDialog({ open, file, pending, error, onClose, onConfirm }: Props) {
  const [confirmation, setConfirmation] = useState('');
  useEffect(() => { if (!open) setConfirmation(''); }, [open]);

  return (
    <Dialog open={open} onClose={pending ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><WarningAmberRounded color="warning" /> Familienarchiv wiederherstellen</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} pt={0.5}>
          <Alert severity="warning">
            Datenbank, Wandfotos und enthaltene Verbindungsschlüssel werden durch den Stand aus diesem Archiv ersetzt. Vorher legt FamilyHub automatisch eine lokale Datenbanksicherung an.
          </Alert>
          <Stack direction="row" gap={1.5} alignItems="center">
            <ArchiveRounded color="primary" />
            <div><Typography fontWeight={700}>{file?.name}</Typography><Typography variant="body2" color="text.secondary">{file ? formatSize(file.size) : ''}</Typography></div>
          </Stack>
          <Typography color="text.secondary">Das Archiv wird vor der Aktivierung vollständig auf sichere Pfade, Prüfsummen, SQLite-Integrität und gültige Fotodateien geprüft.</Typography>
          <TextField label="Zur Bestätigung ARCHIV WIEDERHERSTELLEN eingeben" value={confirmation} onChange={event => setConfirmation(event.target.value)} autoComplete="off" fullWidth />
          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} disabled={pending}>Abbrechen</Button>
        <Button color="warning" variant="contained" startIcon={<ArchiveRounded />} onClick={onConfirm} disabled={pending || confirmation !== 'ARCHIV WIEDERHERSTELLEN'}>
          {pending ? 'Archiv wird geprüft …' : 'Archiv wiederherstellen'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
