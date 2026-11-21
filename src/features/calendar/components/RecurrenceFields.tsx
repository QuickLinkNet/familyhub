import { Box, Button, FormControl, InputLabel, MenuItem, Select, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import type { MouseEvent } from 'react';
import type { RecurrenceFrequency } from '../types/calendar';

const recurrenceLabels: Record<RecurrenceFrequency | '', string> = {
  '': 'Keine Wiederholung', DAILY: 'Täglich', WEEKLY: 'Wöchentlich', MONTHLY: 'Monatlich', YEARLY: 'Jährlich'
};

const weekdays = [
  { value: 1, label: 'Mo' }, { value: 2, label: 'Di' }, { value: 3, label: 'Mi' },
  { value: 4, label: 'Do' }, { value: 5, label: 'Fr' }, { value: 6, label: 'Sa' }, { value: 7, label: 'So' }
];

interface RecurrenceFieldsProps {
  enabled: boolean;
  frequency: RecurrenceFrequency | '';
  interval: number;
  until: string;
  selectedWeekdays: number[];
  start: string;
  onFrequencyChange: (frequency: RecurrenceFrequency | '') => void;
  onIntervalChange: (interval: number) => void;
  onUntilChange: (until: string) => void;
  onWeekdaysChange: (weekdays: number[]) => void;
}

function startWeekday(start: string) {
  const [year, month, day] = start.slice(0, 10).split('-').map(Number);
  const weekday = new Date(year, month - 1, day).getDay();
  return weekday === 0 ? 7 : weekday;
}

export function RecurrenceFields({ enabled, frequency, interval, until, selectedWeekdays, start, onFrequencyChange, onIntervalChange, onUntilChange, onWeekdaysChange }: RecurrenceFieldsProps) {
  const changeFrequency = (value: RecurrenceFrequency | '') => {
    onFrequencyChange(value);
    if (value === 'WEEKLY' && selectedWeekdays.length === 0) onWeekdaysChange([startWeekday(start)]);
  };
  const changeWeekdays = (_event: MouseEvent<HTMLElement>, value: number[]) => {
    if (value.length > 0) onWeekdaysChange([...value].sort((a, b) => a - b));
  };

  return (
    <Stack spacing={2}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: frequency ? '2fr 1fr' : '1fr' }, gap: 2 }}>
        <FormControl disabled={!enabled}>
          <InputLabel id="event-recurrence-label">Wiederholung (lokal)</InputLabel>
          <Select labelId="event-recurrence-label" label="Wiederholung (lokal)" value={frequency} onChange={event => changeFrequency(event.target.value as RecurrenceFrequency | '')}>
            {(Object.keys(recurrenceLabels) as Array<RecurrenceFrequency | ''>).map(value => <MenuItem key={value || 'none'} value={value}>{recurrenceLabels[value]}</MenuItem>)}
          </Select>
        </FormControl>
        {frequency && (
          <TextField
            label="Intervall"
            type="number"
            value={interval}
            onChange={event => onIntervalChange(Math.max(1, Math.min(12, Number(event.target.value))))}
            inputProps={{ min: 1, max: 12 }}
            helperText={frequency === 'WEEKLY' ? (interval === 1 ? 'Jede Woche' : `Alle ${interval} Wochen`) : 'Zwischen 1 und 12'}
          />
        )}
      </Box>
      {frequency === 'WEEKLY' && (
        <Stack spacing={1}>
          <Typography variant="subtitle2">An diesen Tagen</Typography>
          <ToggleButtonGroup value={selectedWeekdays} onChange={changeWeekdays} size="small" fullWidth aria-label="Wochentage der Wiederholung">
            {weekdays.map(day => <ToggleButton key={day.value} value={day.value} aria-label={day.label}>{day.label}</ToggleButton>)}
          </ToggleButtonGroup>
          <Stack direction="row" gap={1} flexWrap="wrap" useFlexGap>
            <Button size="small" variant="outlined" onClick={() => onWeekdaysChange([1, 2, 3, 4, 5])}>Werktage</Button>
            <Button size="small" variant="outlined" onClick={() => onWeekdaysChange([6, 7])}>Wochenende</Button>
            <Button size="small" variant="outlined" onClick={() => onWeekdaysChange([startWeekday(start)])}>Starttag</Button>
          </Stack>
          {interval === 2 && selectedWeekdays.join(',') === '6,7' && <Typography variant="caption" color="text.secondary">Jedes zweite Wochenende</Typography>}
        </Stack>
      )}
      {frequency && <TextField label="Wiederholen bis (optional)" type="date" value={until} onChange={event => onUntilChange(event.target.value)} slotProps={{ inputLabel: { shrink: true } }} helperText="Ohne Datum läuft die Serie unbegrenzt." />}
    </Stack>
  );
}
