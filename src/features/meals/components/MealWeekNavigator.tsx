import { ChevronLeftRounded, ChevronRightRounded, TodayRounded } from '@mui/icons-material';
import { Button, IconButton, Stack, Typography } from '@mui/material';

const range = (start: Date) => { const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6); const formatter = new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'short' }); return `${formatter.format(start)} – ${formatter.format(end)}`; };
export function MealWeekNavigator({ start, onPrevious, onNext, onToday }: { start: Date; onPrevious: () => void; onNext: () => void; onToday: () => void }) {
  return <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}><IconButton aria-label="Vorherige Woche" onClick={onPrevious}><ChevronLeftRounded /></IconButton><Typography variant="h6" textAlign="center">{range(start)}</Typography><Stack direction="row"><Button startIcon={<TodayRounded />} onClick={onToday} sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>Heute</Button><IconButton aria-label="Nächste Woche" onClick={onNext}><ChevronRightRounded /></IconButton></Stack></Stack>;
}
