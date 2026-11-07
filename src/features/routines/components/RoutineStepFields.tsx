import { AddRounded, ArrowDownwardRounded, ArrowUpwardRounded, DeleteOutlineRounded } from '@mui/icons-material';
import { Button, IconButton, Stack, TextField, Typography } from '@mui/material';

interface RoutineStepFieldsProps {
  steps: string[];
  onChange: (steps: string[]) => void;
}

export function RoutineStepFields({ steps, onChange }: RoutineStepFieldsProps) {
  const update = (index: number, value: string) => onChange(steps.map((step, current) => current === index ? value : step));
  const remove = (index: number) => onChange(steps.filter((_, current) => current !== index));
  const move = (index: number, direction: -1 | 1) => {
    const next = [...steps];
    [next[index], next[index + direction]] = [next[index + direction], next[index]];
    onChange(next);
  };

  return (
    <Stack spacing={1.25}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
        <div>
          <Typography variant="subtitle1" fontWeight={800}>Schritte</Typography>
          <Typography variant="caption" color="text.secondary">In genau dieser Reihenfolge sichtbar.</Typography>
        </div>
        <Button size="small" startIcon={<AddRounded />} disabled={steps.length >= 12} onClick={() => onChange([...steps, ''])}>Schritt</Button>
      </Stack>
      {steps.map((step, index) => (
        <Stack key={index} direction="row" alignItems="center" gap={0.5}>
          <Typography variant="body2" fontWeight={800} color="primary.main" sx={{ width: 24, textAlign: 'center' }}>{index + 1}</Typography>
          <TextField required label={`Schritt ${index + 1}`} value={step} onChange={event => update(index, event.target.value)} inputProps={{ maxLength: 100 }} />
          <IconButton size="small" aria-label={`Schritt ${index + 1} nach oben`} disabled={index === 0} onClick={() => move(index, -1)}><ArrowUpwardRounded fontSize="small" /></IconButton>
          <IconButton size="small" aria-label={`Schritt ${index + 1} nach unten`} disabled={index === steps.length - 1} onClick={() => move(index, 1)}><ArrowDownwardRounded fontSize="small" /></IconButton>
          <IconButton size="small" color="error" aria-label={`Schritt ${index + 1} entfernen`} disabled={steps.length <= 2} onClick={() => remove(index)}><DeleteOutlineRounded fontSize="small" /></IconButton>
        </Stack>
      ))}
    </Stack>
  );
}
