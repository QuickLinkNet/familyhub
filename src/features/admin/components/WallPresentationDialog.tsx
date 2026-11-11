import { CloudRounded, DeleteOutlineRounded, PhotoCameraRounded } from '@mui/icons-material';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, IconButton, Stack, Switch, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { apiAssetUrl } from '../../../services/apiClient';
import type { WallPresentationInput, WallPresentationSettings } from '../../wall/types/wallPresentation';

interface Props {
  open: boolean;
  settings: WallPresentationSettings;
  pending: boolean;
  uploadPending: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (input: WallPresentationInput) => Promise<void>;
  onUpload: (photo: File) => void;
  onDelete: (id: string) => void;
}

export function WallPresentationDialog({ open, settings, pending, uploadPending, error, onClose, onSave, onUpload, onDelete }: Props) {
  const [greeting, setGreeting] = useState(settings.greeting);
  const [weatherEnabled, setWeatherEnabled] = useState(settings.weatherEnabled);
  const [weatherLocation, setWeatherLocation] = useState(settings.weatherLocation ?? '');
  useEffect(() => {
    if (!open) return;
    setGreeting(settings.greeting);
    setWeatherEnabled(settings.weatherEnabled);
    setWeatherLocation(settings.weatherLocation ?? '');
  }, [open, settings]);
  const canSave = greeting.trim().length >= 2 && (!weatherEnabled || weatherLocation.trim().length >= 2);

  return (
    <Dialog open={open} onClose={pending ? undefined : onClose} fullWidth maxWidth="md">
      <DialogTitle>Wandmodus gestalten</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <Box>
            <Typography variant="h6" mb={1.5}>Begrüßung</Typography>
            <TextField label="Familiengruß" value={greeting} onChange={event => setGreeting(event.target.value)} inputProps={{ maxLength: 80 }} helperText="Steht groß unter Datum und Uhrzeit." />
          </Box>
          <Box>
            <Stack direction="row" gap={1} alignItems="center" mb={1}><CloudRounded color="primary" /><Typography variant="h6">Wetter</Typography></Stack>
            <FormControlLabel control={<Switch checked={weatherEnabled} onChange={event => setWeatherEnabled(event.target.checked)} />} label="Aktuelles Wetter und Drei-Tage-Ausblick anzeigen" />
            {weatherEnabled && <TextField sx={{ mt: 1.5 }} label="Ort oder Postleitzahl" value={weatherLocation} onChange={event => setWeatherLocation(event.target.value)} placeholder="z. B. Dortmund oder 44359" helperText="FamilyHub ermittelt den Ort beim Speichern automatisch. Kein API-Schlüssel nötig." />}
          </Box>
          <Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} gap={1.5} mb={1.5}>
              <div><Typography variant="h6">Familienfotos</Typography><Typography color="text.secondary">Bis zu acht Bilder rotieren alle 15 Sekunden im Hintergrund.</Typography></div>
              <Button component="label" variant="outlined" startIcon={<PhotoCameraRounded />} disabled={uploadPending || settings.photos.length >= 8}>
                {uploadPending ? 'Wird hochgeladen …' : 'Foto hinzufügen'}
                <input hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={event => { const file = event.target.files?.[0]; if (file) onUpload(file); event.target.value = ''; }} />
              </Button>
            </Stack>
            {settings.photos.length === 0
              ? <Alert severity="info">Ohne Fotos nutzt der Wandmodus einen ruhigen Farbverlauf. Ihr könnt später jederzeit Bilder ergänzen.</Alert>
              : <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }, gap: 1.5 }}>
                {settings.photos.map(photo => (
                  <Box key={photo.id} sx={{ position: 'relative', aspectRatio: '4 / 3', overflow: 'hidden', borderRadius: 3, bgcolor: 'action.hover' }}>
                    <Box component="img" src={apiAssetUrl(`/wall-photos/${photo.id}`)} alt={photo.name} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <IconButton aria-label={`${photo.name} löschen`} onClick={() => onDelete(photo.id)} sx={{ position: 'absolute', top: 6, right: 6, color: 'common.white', bgcolor: 'rgba(25,35,30,.65)', '&:hover': { bgcolor: 'error.main' } }}><DeleteOutlineRounded /></IconButton>
                  </Box>
                ))}
              </Box>}
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} disabled={pending}>Abbrechen</Button>
        <Button variant="contained" disabled={!canSave || pending} onClick={() => void onSave({ greeting: greeting.trim(), weatherEnabled, weatherLocation: weatherLocation.trim() })}>Einstellungen speichern</Button>
      </DialogActions>
    </Dialog>
  );
}
