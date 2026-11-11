import { AutoAwesomeRounded, CloudRounded, PhotoLibraryRounded, TvRounded } from '@mui/icons-material';
import { Alert, Button, Card, CardContent, Chip, CircularProgress, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiError } from '../../../services/apiClient';
import { useDeleteWallPhoto, useUpdateWallPresentation, useUploadWallPhoto, useWallPresentationSettings } from '../../wall/hooks/useWallPresentation';
import type { WallPresentationInput } from '../../wall/types/wallPresentation';
import { WallPresentationDialog } from './WallPresentationDialog';

export function WallPresentationCard({ enabled }: { enabled: boolean }) {
  const settings = useWallPresentationSettings(enabled);
  const update = useUpdateWallPresentation();
  const upload = useUploadWallPhoto();
  const remove = useDeleteWallPhoto();
  const [dialogOpen, setDialogOpen] = useState(false);
  const error = update.error ?? upload.error ?? remove.error;
  const errorMessage = error instanceof ApiError ? error.message : error ? 'Der Wandmodus konnte nicht aktualisiert werden.' : null;
  const save = async (input: WallPresentationInput) => { await update.mutateAsync(input); setDialogOpen(false); };
  const deletePhoto = (id: string) => {
    if (window.confirm('Dieses Foto aus dem Wandmodus entfernen?')) remove.mutate(id);
  };

  return (
    <>
      <Card>
        <CardContent sx={{ p: { xs: 2.5, md: 3 }, '&:last-child': { pb: { xs: 2.5, md: 3 } } }}>
          <Stack direction={{ xs: 'column', lg: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', lg: 'center' }} gap={2.5}>
            <Stack direction="row" gap={1.5} alignItems="flex-start">
              <TvRounded color="primary" fontSize="large" />
              <div>
                <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap"><Typography variant="h6">Wandmodus 2.0</Typography><Chip icon={<AutoAwesomeRounded />} label="Präsentationsbereit" color="secondary" size="small" /></Stack>
                <Typography color="text.secondary">Große Uhr, Familieninfos, Wetter und rotierende Fotos für Touchdisplay oder Fernseher.</Typography>
                {settings.data && <Stack direction="row" gap={1} mt={1.5} flexWrap="wrap"><Chip icon={<PhotoLibraryRounded />} label={`${settings.data.photos.length} Fotos`} variant="outlined" /><Chip icon={<CloudRounded />} label={settings.data.weatherEnabled ? settings.data.weatherLocation : 'Wetter aus'} variant="outlined" /></Stack>}
              </div>
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} gap={1}>
              <Button component={Link} to="/wall" variant="outlined">Wandmodus öffnen</Button>
              <Button variant="contained" onClick={() => setDialogOpen(true)} disabled={!settings.data}>Gestalten</Button>
            </Stack>
          </Stack>
          {settings.isLoading && <Stack alignItems="center" py={2}><CircularProgress size={28} /></Stack>}
          {settings.isError && <Alert severity="error" sx={{ mt: 2 }}>Die Wandmodus-Einstellungen konnten nicht geladen werden.</Alert>}
        </CardContent>
      </Card>
      {settings.data && <WallPresentationDialog open={dialogOpen} settings={settings.data} pending={update.isPending} uploadPending={upload.isPending} error={errorMessage} onClose={() => { update.reset(); upload.reset(); remove.reset(); setDialogOpen(false); }} onSave={save} onUpload={file => upload.mutate(file)} onDelete={deletePhoto} />}
    </>
  );
}
