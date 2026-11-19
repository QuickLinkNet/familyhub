import { ArrowDownwardRounded, ArrowUpwardRounded } from '@mui/icons-material';
import { Box, Checkbox, IconButton, Paper, Stack, Tooltip, Typography } from '@mui/material';
import type { PreferenceOption } from '../constants/profilePreferences';

type Props<T extends string> = {
  options: PreferenceOption<T>[];
  selected: T[];
  onChange: (selected: T[]) => void;
};

export function PreferenceToggleGrid<T extends string>({ options, selected, onChange }: Props<T>) {
  const toggle = (id: T) => {
    const next = selected.includes(id) ? selected.filter(item => item !== id) : [...selected, id];
    if (next.length > 0) onChange(next);
  };
  const move = (id: T, offset: number) => {
    const index = selected.indexOf(id); const target = index + offset;
    if (index < 0 || target < 0 || target >= selected.length) return;
    const next = [...selected]; [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };
  const ordered = [...selected.map(id => options.find(option => option.id === id)).filter((option): option is PreferenceOption<T> => Boolean(option)), ...options.filter(option => !selected.includes(option.id))];
  return (
    <Stack display="grid" gridTemplateColumns={{ xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }} gap={1.25}>
      {ordered.map(option => {
        const checked = selected.includes(option.id);
        const index = selected.indexOf(option.id);
        return (
          <Paper key={option.id} variant="outlined" sx={{ p: 1.25, display: 'flex', alignItems: 'center', borderColor: checked ? 'primary.main' : 'divider' }}>
            <Checkbox checked={checked} onChange={() => toggle(option.id)} inputProps={{ 'aria-label': option.label }} />
            <Box flex={1} onClick={() => toggle(option.id)} sx={{ cursor: 'pointer' }}><Typography fontWeight={800}>{option.label}</Typography><Typography variant="body2" color="text.secondary">{option.description}</Typography></Box>
            {checked && <Stack direction="row">
              <Tooltip title="Nach oben"><span><IconButton size="small" aria-label={`${option.label} nach oben`} disabled={index === 0} onClick={() => move(option.id, -1)}><ArrowUpwardRounded fontSize="small" /></IconButton></span></Tooltip>
              <Tooltip title="Nach unten"><span><IconButton size="small" aria-label={`${option.label} nach unten`} disabled={index === selected.length - 1} onClick={() => move(option.id, 1)}><ArrowDownwardRounded fontSize="small" /></IconButton></span></Tooltip>
            </Stack>}
          </Paper>
        );
      })}
    </Stack>
  );
}
