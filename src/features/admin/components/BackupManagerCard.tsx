import { BackupRounded, CloudDownloadRounded, RestoreRounded, ShieldRounded, UploadFileRounded } from '@mui/icons-material';
import { Alert, Button, Card, CardContent, Chip, CircularProgress, Divider, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { useRef, useState } from 'react';
import { ApiError } from '../../../services/apiClient';
import { backupDownloadUrl } from '../api/backupApi';
import { useBackups, useCreateBackup, useRestoreBackup, useRestoreUploadedBackup } from '../hooks/useBackups';
import type { BackupFile } from '../types/backup';
import { BackupRestoreDialog } from './BackupRestoreDialog';

const reasonLabel = (reason: string) => ({ manual: 'Manuell', 'before-migration': 'Vor Update', 'before-restore': 'Vor Wiederherstellung' })[reason] ?? reason;
const formatSize = (bytes: number) => bytes < 1_048_576 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1_048_576).toFixed(1)} MB`;

export function BackupManagerCard({ enabled }: { enabled: boolean }) {
  const overview = useBackups(enabled);
  const create = useCreateBackup();
  const restore = useRestoreBackup();
  const restoreUpload = useRestoreUploadedBackup();
  const fileInput = useRef<HTMLInputElement>(null);
  const [selection, setSelection] = useState<{ backup?: BackupFile; file?: File } | null>(null);
  const error = create.error ?? restore.error ?? restoreUpload.error;
  const message = error instanceof ApiError ? error.message : error ? 'Die Sicherungsaktion konnte nicht abgeschlossen werden.' : null;
  const pending = restore.isPending || restoreUpload.isPending;

  const close = () => {
    if (pending) return;
    restore.reset(); restoreUpload.reset(); setSelection(null);
    if (fileInput.current) fileInput.current.value = '';
  };
  const confirmRestore = async () => {
    try {
      if (selection?.backup) await restore.mutateAsync(selection.backup.id);
      else if (selection?.file) await restoreUpload.mutateAsync(selection.file);
      window.location.reload();
    } catch { /* The mutation error remains visible in the dialog. */ }
  };

  return (
    <>
      <Card>
        <CardContent sx={{ p: { xs: 2.5, md: 3 }, '&:last-child': { pb: { xs: 2.5, md: 3 } } }}>
          <Stack spacing={2.5}>
            <Stack direction={{ xs: 'column', lg: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', lg: 'center' }} gap={2}>
              <Stack direction="row" gap={1.5} alignItems="flex-start">
                <ShieldRounded color="primary" fontSize="large" />
                <div>
                  <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
                    <Typography variant="h6">Datensicherung</Typography>
                    <Chip label={`${overview.data?.backups.length ?? 0} Sicherungen`} size="small" variant="outlined" />
                  </Stack>
                  <Typography color="text.secondary">SQLite-Sicherungen lokal verwalten, herunterladen und kontrolliert wiederherstellen.</Typography>
                </div>
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} gap={1}>
                <input ref={fileInput} type="file" accept=".sqlite,application/vnd.sqlite3" hidden onChange={event => { const file = event.target.files?.[0]; if (file) setSelection({ file }); }} />
                <Button variant="outlined" startIcon={<UploadFileRounded />} onClick={() => fileInput.current?.click()}>Sicherung einspielen</Button>
                <Button variant="contained" startIcon={<BackupRounded />} onClick={() => create.mutate()} disabled={create.isPending}>
                  {create.isPending ? 'Sichert …' : 'Jetzt sichern'}
                </Button>
              </Stack>
            </Stack>
            {overview.data?.pendingRestore && <Alert severity="warning">Eine Wiederherstellung ist vorbereitet und wird beim nächsten Serverzugriff aktiviert.</Alert>}
            {message && !selection && <Alert severity="error">{message}</Alert>}
            {create.isSuccess && <Alert severity="success">Die neue Sicherung wurde vollständig geprüft und gespeichert.</Alert>}
            {overview.isLoading && <Stack alignItems="center" py={2}><CircularProgress size={28} /></Stack>}
            {overview.isError && <Alert severity="error">Die Sicherungen konnten nicht geladen werden.</Alert>}
            {overview.data && overview.data.backups.length === 0 && <Alert severity="info">Noch keine Sicherung vorhanden. FamilyHub legt vor Datenbank-Updates automatisch Sicherungen an.</Alert>}
            {overview.data && overview.data.backups.slice(0, 5).map((backup, index) => (
              <div key={backup.id}>
                {index > 0 && <Divider sx={{ mb: 1.5 }} />}
                <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
                  <Stack minWidth={0}>
                    <Typography fontWeight={700}>{new Date(backup.createdAt).toLocaleString('de-DE')}</Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>{reasonLabel(backup.reason)} · {formatSize(backup.size)} · SHA-256 {backup.checksumSha256.slice(0, 10)}…</Typography>
                  </Stack>
                  <Stack direction="row">
                    <Tooltip title="Sicherung herunterladen"><IconButton component="a" href={backupDownloadUrl(backup.id)}><CloudDownloadRounded /></IconButton></Tooltip>
                    <Tooltip title="Diesen Stand wiederherstellen"><IconButton color="warning" onClick={() => setSelection({ backup })}><RestoreRounded /></IconButton></Tooltip>
                  </Stack>
                </Stack>
              </div>
            ))}
          </Stack>
        </CardContent>
      </Card>
      <BackupRestoreDialog open={selection !== null} backup={selection?.backup} file={selection?.file} pending={pending} error={selection ? message : null} onClose={close} onConfirm={() => void confirmRestore()} />
    </>
  );
}
