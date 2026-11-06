import { Button, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';

const weekdays = [
  { value: 1, label: 'Mo' },
  { value: 2, label: 'Di' },
  { value: 3, label: 'Mi' },
  { value: 4, label: 'Do' },
  { value: 5, label: 'Fr' },
  { value: 6, label: 'Sa' },
  { value: 7, label: 'So' },
];

interface RoutineDayPickerProps {
  value: number[];
  onChange: (days: number[]) => void;
}

export function RoutineDayPicker({ value, onChange }: RoutineDayPickerProps) {
  return (
    <Stack spacing={1}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1} flexWrap="wrap">
        <Typography variant="subtitle2">Wiederholen an</Typography>
        <Stack direction="row" gap={0.5}>
          <Button size="small" onClick={() => onChange([1, 2, 3, 4, 5])}>Werktags</Button>
          <Button size="small" onClick={() => onChange([1, 2, 3, 4, 5, 6, 7])}>Täglich</Button>
        </Stack>
      </Stack>
      <ToggleButtonGroup
        value={value}
        onChange={(_, days: number[]) => onChange(days)}
        aria-label="Wochentage der Routine"
        sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5, '& .MuiToggleButtonGroup-grouped': { border: 1, borderColor: 'divider', borderRadius: '12px !important', minWidth: 0, px: 0.5 } }}
      >
        {weekdays.map(day => <ToggleButton key={day.value} value={day.value} aria-label={day.label}>{day.label}</ToggleButton>)}
      </ToggleButtonGroup>
      {value.length === 0 && <Typography variant="caption" color="error">Bitte mindestens einen Wochentag auswählen.</Typography>}
    </Stack>
  );
}
