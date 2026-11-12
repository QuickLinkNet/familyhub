import { ArchiveRounded, DownloadRounded, KeyRounded, PhotoLibraryRounded, StorageRounded, UploadFileRounded } from '@mui/icons-material';
import { Alert, Button, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { useRef, useState } from 'react';
import { ApiError } from '../../../services/apiClient';
import { archiveDownloadUrl } from '../api/backupApi';
import { useRestoreUploadedArchive } from '../hooks/useBackups';
import { ArchiveRestoreDialog } from './ArchiveRestoreDialog';

export function PortableArchiveCard({ preview = false }: { preview?: boolean }) {
  const restore = useRestoreUploadedArchive();
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(() => preview ? new File(['FamilyHub QA preview'], 'familie-qa.familyhub', { type: 'application/zip' }) : null);
  const error = restore.error;
  const message = error instanceof ApiError ? error.message : error ? 'Das Familienarchiv konnte nicht wiederhergestellt werden.' : null;
  const close = () => {
    if (restore.isPending) return;
    restore.reset(); setFile(null);
    if (input.current) input.current.value = '';
  };
  const confirm = async () => {
    if (!file) return;
    try { await restore.mutateAsync(file); window.location.reload(); }
    catch { /* The safe API error remains visible in the dialog. */ }
  };

  return (
    <>
      <Card sx={{ border: theme => `1px solid ${theme.palette.primary.main}30` }}>
        <CardContent sx={{ p: { xs: 2.5, md: 3 }, '&:last-child': { pb: { xs: 2.5, md: 3 } } }}>
          <Stack spacing={2.5}>
            <Stack direction={{ xs: 'column', lg: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', lg: 'center' }} gap={2.5}>
              <Stack direction="row" gap={1.5} alignItems="flex-start">
                <ArchiveRounded color="primary" fontSize="large" />
                <div>
                  <Typography variant="h6">Portables Familienarchiv</Typography>
                  <Typography color="text.secondary">Ein Download für Serverumzug, Notfallkopie oder sichere Aufbewahrung eures vollständigen Familienstands.</Typography>
                </div>
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} gap={1}>
                <input ref={input} type="file" accept=".familyhub,.zip,application/zip" hidden onChange={event => { const selected = event.target.files?.[0]; if (selected) setFile(selected); }} />
                <Button variant="outlined" startIcon={<UploadFileRounded />} onClick={() => input.current?.click()}>Archiv einspielen</Button>
                <Button component="a" href={archiveDownloadUrl()} variant="contained" startIcon={<DownloadRounded />}>Komplettarchiv laden</Button>
              </Stack>
            </Stack>
            <Stack direction="row" gap={1} flexWrap="wrap">
              <Chip icon={<StorageRounded />} label="Alle Familiendaten" variant="outlined" />
              <Chip icon={<PhotoLibraryRounded />} label="Wandfotos" variant="outlined" />
              <Chip icon={<KeyRounded />} label="Verbindungsschlüssel" variant="outlined" />
            </Stack>
            <Alert severity="info">Das Archiv enthält vertrauliche Familien- und Zugangsdaten. Bewahre die Datei wie ein wichtiges Passwort sicher auf.</Alert>
          </Stack>
        </CardContent>
      </Card>
      <ArchiveRestoreDialog open={file !== null} file={file} pending={restore.isPending} error={file ? message : null} onClose={close} onConfirm={() => void confirm()} />
    </>
  );
}
