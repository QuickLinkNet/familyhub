import { AddRounded, CalendarViewDayRounded, CalendarViewMonthRounded, ViewColumnRounded, ViewTimelineRounded, ViewWeekRounded } from '@mui/icons-material';
import { Button, FormControl, InputLabel, MenuItem, Select, Stack, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { PageHeader } from '../../../components/molecules/PageHeader';

export type CalendarView = 'day' | 'timeline' | 'five-day' | 'week' | 'month';

interface CalendarHeaderProps {
  view: CalendarView;
  canManage: boolean;
  onViewChange: (view: CalendarView) => void;
  onCreate: () => void;
}

export function CalendarHeader({ view, canManage, onViewChange, onCreate }: CalendarHeaderProps) {
  const actions = (
    <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.5}>
      <FormControl fullWidth sx={{ display: { xs: 'flex', md: 'none' } }}>
        <InputLabel id="calendar-view-label">Ansicht</InputLabel>
        <Select labelId="calendar-view-label" label="Ansicht" value={view} onChange={event => onViewChange(event.target.value as CalendarView)}>
          <MenuItem value="day">Tag</MenuItem>
          <MenuItem value="timeline">Timeline</MenuItem>
          <MenuItem value="five-day">5 Tage</MenuItem>
          <MenuItem value="week">Woche</MenuItem>
          <MenuItem value="month">Monat</MenuItem>
        </Select>
      </FormControl>
      <ToggleButtonGroup
        exclusive
        value={view}
        onChange={(_event, value: CalendarView | null) => { if (value) onViewChange(value); }}
        aria-label="Kalenderansicht"
        size="small"
        sx={{ display: { xs: 'none', md: 'inline-flex' }, '& .MuiToggleButton-root': { minHeight: theme => theme.familyHub.touchTarget, px: 2, textTransform: 'none', fontWeight: 700 } }}
      >
        <ToggleButton value="day" aria-label="Tagesansicht"><CalendarViewDayRounded sx={{ mr: 1 }} /><BoxLabel>Tag</BoxLabel></ToggleButton>
        <ToggleButton value="timeline" aria-label="Timeline-Ansicht"><ViewTimelineRounded sx={{ mr: 1 }} /><BoxLabel>Timeline</BoxLabel></ToggleButton>
        <ToggleButton value="five-day" aria-label="5-Tage-Ansicht"><ViewColumnRounded sx={{ mr: 1 }} /><BoxLabel>5 Tage</BoxLabel></ToggleButton>
        <ToggleButton value="week" aria-label="Wochenansicht"><ViewWeekRounded sx={{ mr: 1 }} /><BoxLabel>Woche</BoxLabel></ToggleButton>
        <ToggleButton value="month" aria-label="Monatsansicht"><CalendarViewMonthRounded sx={{ mr: 1 }} /><BoxLabel>Monat</BoxLabel></ToggleButton>
      </ToggleButtonGroup>
      {canManage && <Button variant="contained" startIcon={<AddRounded />} onClick={onCreate}>Termin hinzufügen</Button>}
    </Stack>
  );

  return <PageHeader title="Familienkalender" description="Alle Termine und persönlichen Kalender auf einen Blick." actions={actions} />;
}

function BoxLabel({ children }: { children: string }) {
  return <span>{children}</span>;
}
