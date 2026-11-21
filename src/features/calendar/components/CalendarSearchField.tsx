import { CloseRounded, SearchRounded } from '@mui/icons-material';
import { IconButton, InputAdornment, TextField } from '@mui/material';
import { useRef } from 'react';

interface CalendarSearchFieldProps {
  value: string;
  resultCount: number;
  totalCount: number;
  onChange: (value: string) => void;
}

function resultLabel(resultCount: number, totalCount: number) {
  const resultNoun = resultCount === 1 ? 'Termin' : 'Termine';
  const totalNoun = totalCount === 1 ? 'Termin' : 'Terminen';
  return `${resultCount} ${resultNoun} von ${totalCount} ${totalNoun} gefunden`;
}

export function CalendarSearchField({ value, resultCount, totalCount, onChange }: CalendarSearchFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const active = value.trim().length > 0;
  const clear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  return (
    <TextField
      inputRef={inputRef}
      label="Termine durchsuchen"
      placeholder="Titel, Ort, Kalender oder Person"
      value={value}
      onChange={event => onChange(event.target.value)}
      inputProps={{ maxLength: 120 }}
      helperText={active ? resultLabel(resultCount, totalCount) : 'Durchsucht den aktuell sichtbaren Zeitraum.'}
      FormHelperTextProps={active ? { 'aria-live': 'polite' } : undefined}
      slotProps={{
        input: {
          startAdornment: <InputAdornment position="start"><SearchRounded color="action" /></InputAdornment>,
          endAdornment: active
            ? <InputAdornment position="end"><IconButton aria-label="Suche löschen" edge="end" onClick={clear}><CloseRounded /></IconButton></InputAdornment>
            : undefined
        }
      }}
    />
  );
}
