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
  const previousLabel = view === 'week' ? 'Vorherige Woche' : 'Vorheriger Monat';
  const nextLabel = view === 'week' ? 'Nächste Woche' : 'Nächster Monat';

  return (
    <Card>
      <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} gap={1.5}>
          <Stack direction="row" alignItems="center" justifyContent={{ xs: 'space-between', sm: 'flex-start' }} gap={0.5}>
            <IconButton aria-label={previousLabel} onClick={onPrevious}><ChevronLeftRounded /></IconButton>
            <Typography variant="h6" sx={{ minWidth: { sm: 260 }, textAlign: 'center', textTransform: view === 'month' ? 'capitalize' : 'none' }}>{label}</Typography>
            <IconButton aria-label={nextLabel} onClick={onNext}><ChevronRightRounded /></IconButton>
          </Stack>
          <Button variant="outlined" onClick={onToday}>Heute</Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
