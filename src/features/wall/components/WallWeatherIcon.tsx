import { AcUnitRounded, CloudRounded, GrainRounded, NightsStayRounded, ThunderstormRounded, WbSunnyRounded } from '@mui/icons-material';

export function WallWeatherIcon({ code, isDay = true, fontSize = 54 }: { code: number; isDay?: boolean; fontSize?: number }) {
  const sx = { fontSize };
  if (code === 0) return isDay ? <WbSunnyRounded sx={sx} /> : <NightsStayRounded sx={sx} />;
  if (code <= 3 || code === 45 || code === 48) return <CloudRounded sx={sx} />;
  if (code >= 71 && code <= 77) return <AcUnitRounded sx={sx} />;
  if (code >= 95) return <ThunderstormRounded sx={sx} />;
  return <GrainRounded sx={sx} />;
}

export function weatherLabel(code: number) {
  if (code === 0) return 'Klar';
  if (code <= 3) return 'Bewölkt';
  if (code === 45 || code === 48) return 'Nebel';
  if (code >= 51 && code <= 67) return 'Regen';
  if (code >= 71 && code <= 77) return 'Schnee';
  if (code >= 80 && code <= 82) return 'Schauer';
  if (code >= 95) return 'Gewitter';
  return 'Wechselhaft';
}
