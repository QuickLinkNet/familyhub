import { ChevronLeftRounded, ChevronRightRounded } from '@mui/icons-material';
import { Button, Card, CardContent, IconButton, Stack, Typography } from '@mui/material';
import type { CalendarView } from './CalendarHeader';

interface CalendarPeriodNavigationProps {
  view: CalendarView;
  label: string;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
}

export function CalendarPeriodNavigation({ view, label, onPrevious, onNext, onToday }: CalendarPeriodNavigationProps) {
  const labels = view === 'day'
    ? { previous: 'Vorheriger Tag', next: 'Nächster Tag' }
    : view === 'week'
      ? { previous: 'Vorherige Woche', next: 'Nächste Woche' }
      : { previous: 'Vorheriger Monat', next: 'Nächster Monat' };

  return (
    <Card>
      <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} gap={1.5}>
          <Stack direction="row" alignItems="center" justifyContent={{ xs: 'space-between', sm: 'flex-start' }} gap={0.5}>
            <IconButton aria-label={labels.previous} onClick={onPrevious}><ChevronLeftRounded /></IconButton>
            <Typography variant="h6" sx={{ minWidth: { sm: 260 }, textAlign: 'center', textTransform: view !== 'week' ? 'capitalize' : 'none' }}>{label}</Typography>
            <IconButton aria-label={labels.next} onClick={onNext}><ChevronRightRounded /></IconButton>
          </Stack>
          <Button variant="outlined" onClick={onToday}>Heute</Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
