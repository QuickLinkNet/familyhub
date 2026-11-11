import { BedtimeRounded, HomeRounded, WbTwilightRounded } from '@mui/icons-material';
import { Box, Button, Chip, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { IdleWallReturnButton } from './IdleWallReturnButton';

interface WallNightModeProps {
  now: Date;
  activeFrom: string;
  showReturn: boolean;
  onShowDay: () => void;
}

const timeFormatter = new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit' });
const dateFormatter = new Intl.DateTimeFormat('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });

export function WallNightMode({ now, activeFrom, showReturn, onShowDay }: WallNightModeProps) {
  const drift = [{ x: -3, y: -2 }, { x: 3, y: -1 }, { x: 2, y: 3 }, { x: -2, y: 2 }][Math.floor(now.getMinutes() / 15) % 4];

  return (
    <Box sx={{
      minHeight: '100vh', bgcolor: '#050806', color: 'rgba(220,232,224,.68)',
      backgroundImage: 'radial-gradient(circle at 50% 40%, rgba(41,72,54,.18), transparent 42%)',
      display: 'grid', placeItems: 'center', p: 3, overflow: 'hidden'
    }}>
      <Stack alignItems="center" textAlign="center" spacing={2.5} sx={{ transform: `translate(${drift.x}vw, ${drift.y}vh)`, transition: 'transform 2s ease' }}>
        <Chip icon={<BedtimeRounded />} label="Nachtmodus" sx={{ color: 'rgba(210,226,216,.58)', bgcolor: 'rgba(255,255,255,.035)', '& .MuiChip-icon': { color: 'inherit' } }} />
        <Typography component="time" variant="h1" sx={{ fontSize: { xs: '5rem', sm: '8rem', md: '11rem' }, lineHeight: .82, letterSpacing: '-.075em', fontWeight: 720, color: 'rgba(226,236,230,.72)' }}>
          {timeFormatter.format(now)}
        </Typography>
        <Typography variant="h5" sx={{ textTransform: 'capitalize', color: 'rgba(210,224,215,.48)' }}>{dateFormatter.format(now)}</Typography>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ pt: 1 }}>
          <WbTwilightRounded sx={{ opacity: .52 }} />
          <Typography>Tagesansicht ab {activeFrom} Uhr</Typography>
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} pt={2}>
          <Button component={Link} to="/" variant="text" startIcon={<HomeRounded />} sx={nightButton}>Übersicht</Button>
          <Button variant="outlined" startIcon={<WbTwilightRounded />} onClick={onShowDay} sx={nightButton}>Tagesansicht für 30 Minuten</Button>
        </Stack>
      </Stack>
      {showReturn && <IdleWallReturnButton />}
    </Box>
  );
}

const nightButton = {
  color: 'rgba(216,230,221,.62)', borderColor: 'rgba(216,230,221,.18)',
  '&:hover': { borderColor: 'rgba(216,230,221,.34)', bgcolor: 'rgba(255,255,255,.04)' }
};
