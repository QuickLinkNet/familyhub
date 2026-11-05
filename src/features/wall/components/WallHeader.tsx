import { FullscreenRounded, HomeRounded } from '@mui/icons-material';
import { Button, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

interface WallHeaderProps {
  now: Date;
}

const dayFormatter = new Intl.DateTimeFormat('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });
const timeFormatter = new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit' });

export function WallHeader({ now }: WallHeaderProps) {
  const enterFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      // Browser ohne Vollbildfreigabe behält die normale Wandansicht bei.
    }
  };
  return (
    <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', md: 'center' }} gap={2}>
      <div>
        <Typography variant="overline" color="primary" fontWeight={800}>Familienkompass · Wandmodus</Typography>
        <Typography variant="h2" sx={{ fontSize: { xs: '3rem', md: '5.25rem' }, lineHeight: 1 }}>{timeFormatter.format(now)}</Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mt: 1, textTransform: 'capitalize' }}>{dayFormatter.format(now)}</Typography>
      </div>
      <Stack direction="row" gap={1}>
        <Button component={Link} to="/" variant="outlined" startIcon={<HomeRounded />}>Übersicht</Button>
        <Button variant="contained" startIcon={<FullscreenRounded />} onClick={() => void enterFullscreen()}>Vollbild</Button>
      </Stack>
    </Stack>
  );
}
