import { FullscreenRounded, HomeRounded, LightModeRounded } from '@mui/icons-material';
import { Box, Button, Chip, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { apiAssetUrl } from '../../../services/apiClient';
import { useRotatingWallPhoto } from '../hooks/useWallPresentation';
import type { WallPresentation } from '../types/wallPresentation';
import { WallWeather } from './WallWeather';
import type { ScreenWakeLockStatus } from '../hooks/useScreenWakeLock';

interface WallHeaderProps {
  now: Date;
  presentation: WallPresentation;
  wakeLock: { status: ScreenWakeLockStatus; retry: () => Promise<void> };
}

const dayFormatter = new Intl.DateTimeFormat('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });
const timeFormatter = new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit' });

export function WallHeader({ now, presentation, wakeLock }: WallHeaderProps) {
  const photo = useRotatingWallPhoto(presentation.photos);
  const enterFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch { /* Browser ohne Vollbildfreigabe behält die normale Wandansicht bei. */ }
  };
  const photoUrl = photo ? apiAssetUrl(`/wall-photos/${photo.id}`) : null;

  return (
    <Box sx={{
      position: 'relative', overflow: 'hidden', minHeight: { xs: 440, md: 390 }, borderRadius: { xs: 5, md: 7 },
      bgcolor: 'primary.dark', color: 'common.white', boxShadow: '0 24px 70px rgba(25, 55, 40, 0.22)',
      backgroundImage: photoUrl
        ? `linear-gradient(90deg, rgba(20,40,30,.88) 0%, rgba(20,40,30,.64) 52%, rgba(20,40,30,.34) 100%), url("${photoUrl}")`
        : 'radial-gradient(circle at 85% 15%, rgba(214,133,95,.75), transparent 34%), linear-gradient(135deg, #254434 0%, #345b48 58%, #537460 100%)',
      backgroundSize: 'cover', backgroundPosition: 'center'
    }}>
      <Stack sx={{ position: 'relative', minHeight: 'inherit', p: { xs: 2.5, sm: 3.5, md: 4.5 } }} justifyContent="space-between" gap={3}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} gap={1.5}>
          <Chip label="Familienkompass · Wandmodus" sx={{ alignSelf: 'flex-start', color: 'common.white', bgcolor: 'rgba(255,255,255,.14)', fontWeight: 800, backdropFilter: 'blur(12px)' }} />
          <Stack direction="row" gap={1} flexWrap="wrap">
            {wakeLock.status === 'active' && <Chip icon={<LightModeRounded />} label="Bildschirm bleibt an" sx={{ color: 'common.white', bgcolor: 'rgba(255,255,255,.14)', '& .MuiChip-icon': { color: 'inherit' } }} />}
            {wakeLock.status === 'blocked' && <Button variant="outlined" startIcon={<LightModeRounded />} onClick={() => void wakeLock.retry()} sx={glassButton}>Bildschirm aktivieren</Button>}
            <Button component={Link} to="/" variant="outlined" startIcon={<HomeRounded />} sx={{ ...glassButton, flex: { xs: 1, sm: 'initial' } }}>Übersicht</Button>
            <Button variant="contained" startIcon={<FullscreenRounded />} onClick={() => void enterFullscreen()} sx={{ flex: { xs: 1, sm: 'initial' }, bgcolor: 'common.white', color: 'primary.dark', '&:hover': { bgcolor: 'rgba(255,255,255,.88)' } }}>Vollbild</Button>
          </Stack>
        </Stack>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', md: 'flex-end' }} gap={3}>
          <div>
            <Typography variant="h2" sx={{ fontSize: { xs: '4.2rem', sm: '5.4rem', md: '7rem' }, fontWeight: 780, lineHeight: 0.86, letterSpacing: '-0.07em' }}>{timeFormatter.format(now)}</Typography>
            <Typography variant="h5" sx={{ mt: 2, textTransform: 'capitalize', opacity: 0.84 }}>{dayFormatter.format(now)}</Typography>
            <Typography variant="h4" sx={{ mt: 1.25, maxWidth: 680, fontSize: { xs: '1.8rem', md: '2.6rem' } }}>{presentation.greeting}</Typography>
          </div>
          <WallWeather presentation={presentation} />
        </Stack>
      </Stack>
    </Box>
  );
}

const glassButton = {
  color: 'common.white', borderColor: 'rgba(255,255,255,.5)', bgcolor: 'rgba(20,37,29,.18)',
  backdropFilter: 'blur(10px)', '&:hover': { borderColor: 'common.white', bgcolor: 'rgba(20,37,29,.34)' }
};
