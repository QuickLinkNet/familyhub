import { Checkbox, FormControlLabel, Stack, ToggleButton, Typography } from '@mui/material';

const reminderOptions = [
  { minutes: 0, label: 'Zum Start' },
  { minutes: 15, label: '15 Min.' },
  { minutes: 30, label: '30 Min.' },
  { minutes: 60, label: '1 Std.' },
  { minutes: 120, label: '2 Std.' },
  { minutes: 1440, label: '1 Tag' }
];

interface EventReminderFieldsProps {
  offsets: number[];
  boardSound: boolean;
  onOffsetsChange: (offsets: number[]) => void;
  onBoardSoundChange: (enabled: boolean) => void;
}

export function EventReminderFields({ offsets, boardSound, onOffsetsChange, onBoardSoundChange }: EventReminderFieldsProps) {
  const toggle = (minutes: number) => {
    const next = offsets.includes(minutes) ? offsets.filter(offset => offset !== minutes) : [...offsets, minutes];
    next.sort((left, right) => right - left);
    onOffsetsChange(next);
    if (next.length === 0) onBoardSoundChange(false);
  };

  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2">Erinnerungen</Typography>
      <Typography variant="body2" color="text.secondary">Mehrere Zeitpunkte sind möglich. Ohne Auswahl erinnert FamilyHub nicht.</Typography>
      <Stack display="grid" gridTemplateColumns={{ xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' }} gap={1}>
        {reminderOptions.map(option => (
          <ToggleButton key={option.minutes} value={option.minutes} selected={offsets.includes(option.minutes)} onClick={() => toggle(option.minutes)} size="small">
            {option.label}
          </ToggleButton>
        ))}
      </Stack>
      <FormControlLabel
        control={<Checkbox checked={boardSound} disabled={offsets.length === 0} onChange={event => onBoardSoundChange(event.target.checked)} />}
        label="Ruhiger Signalton im Wandmodus"
      />
      {boardSound && <Typography variant="caption" color="text.secondary">Der Ton wird je Erinnerungszeit einmal versucht und respektiert Ruhezeiten.</Typography>}
    </Stack>
  );
}
