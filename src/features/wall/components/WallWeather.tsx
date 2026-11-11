import { Box, Stack, Typography } from '@mui/material';
import type { WallPresentation } from '../types/wallPresentation';
import { WallWeatherIcon, weatherLabel } from './WallWeatherIcon';

const weekday = new Intl.DateTimeFormat('de-DE', { weekday: 'short' });

export function WallWeather({ presentation }: { presentation: WallPresentation }) {
  if (!presentation.weatherEnabled) return null;
  if (!presentation.weather) {
    return <Box sx={weatherBox}><Typography fontWeight={800}>{presentation.weatherLocation}</Typography><Typography sx={{ opacity: 0.76 }}>Wetter gerade nicht verfügbar</Typography></Box>;
  }
  const weather = presentation.weather;
  return (
    <Box sx={weatherBox} aria-label={`Wetter in ${presentation.weatherLocation ?? 'eurem Ort'}`}>
      <Stack direction="row" alignItems="center" gap={1.5}>
        <WallWeatherIcon code={weather.weatherCode} isDay={weather.isDay} />
        <div>
          <Typography variant="h3" lineHeight={1}>{weather.temperature}°</Typography>
          <Typography fontWeight={800}>{weatherLabel(weather.weatherCode)} · {presentation.weatherLocation}</Typography>
          <Typography variant="body2" sx={{ opacity: 0.76 }}>Gefühlt {weather.apparentTemperature}°</Typography>
        </div>
      </Stack>
      <Stack direction="row" gap={1} mt={2}>
        {weather.forecast.slice(0, 3).map(day => (
          <Stack key={day.date} alignItems="center" sx={{ flex: 1, minWidth: 68, p: 1, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.13)' }}>
            <Typography variant="caption" fontWeight={800}>{weekday.format(new Date(`${day.date}T12:00:00`))}</Typography>
            <WallWeatherIcon code={day.weatherCode} fontSize={24} />
            <Typography variant="caption">{day.maximum}° / {day.minimum}°</Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}

const weatherBox = {
  minWidth: { md: 330 },
  p: 2.25,
  borderRadius: 5,
  color: 'common.white',
  bgcolor: 'rgba(20, 37, 29, 0.42)',
  border: '1px solid rgba(255,255,255,0.18)',
  backdropFilter: 'blur(16px)'
};
