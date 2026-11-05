import type { MouseEvent } from 'react';
import { AddRounded, CalendarViewMonthRounded, ViewWeekRounded } from '@mui/icons-material';
import { Button, Stack, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { PageHeader } from '../../../components/molecules/PageHeader';

export type CalendarView = 'week' | 'month';

interface CalendarHeaderProps {
  view: CalendarView;
  canManage: boolean;
  onViewChange: (event: MouseEvent<HTMLElement>, view: CalendarView | null) => void;
  onCreate: () => void;
}

export function CalendarHeader({ view, canManage, onViewChange, onCreate }: CalendarHeaderProps) {
  const actions = (
    <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.5}>
      <ToggleButtonGroup
        exclusive
        value={view}
        onChange={onViewChange}
        aria-label="Kalenderansicht"
        size="small"
        sx={{ '& .MuiToggleButton-root': { minHeight: 48, px: 2, flex: { xs: 1, sm: 'initial' }, textTransform: 'none', fontWeight: 700 } }}
      >
        <ToggleButton value="week" aria-label="Wochenansicht"><ViewWeekRounded sx={{ mr: 1 }} />Woche</ToggleButton>
        <ToggleButton value="month" aria-label="Monatsansicht"><CalendarViewMonthRounded sx={{ mr: 1 }} />Monat</ToggleButton>
      </ToggleButtonGroup>
      {canManage && <Button variant="contained" startIcon={<AddRounded />} onClick={onCreate}>Termin hinzufügen</Button>}
    </Stack>
  );

  return <PageHeader title="Familienkalender" description="Alle Termine und persönlichen Kalender auf einen Blick." actions={actions} />;
}
