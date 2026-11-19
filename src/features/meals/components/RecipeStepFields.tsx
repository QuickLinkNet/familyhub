import { AddRounded, DeleteOutlineRounded } from '@mui/icons-material';
import { Button, IconButton, Stack, TextField } from '@mui/material';

export function RecipeStepFields({ value, onChange }: { value: string[]; onChange: (value: string[]) => void }) {
  const update = (index: number, text: string) => onChange(value.map((step, current) => current === index ? text : step));
  const remove = (index: number) => onChange(value.filter((_, current) => current !== index));
  return <Stack gap={1.25}>{value.map((step, index) => <Stack key={index} direction="row" gap={1} alignItems="flex-start">
    <TextField multiline minRows={1} label={`Schritt ${index + 1}`} value={step} onChange={event => update(index, event.target.value)} inputProps={{ maxLength: 500 }} fullWidth />
    <IconButton aria-label={`Schritt ${index + 1} entfernen`} onClick={() => remove(index)}><DeleteOutlineRounded /></IconButton>
  </Stack>)}<Button startIcon={<AddRounded />} onClick={() => onChange([...value, ''])} disabled={value.length >= 30} sx={{ alignSelf: 'flex-start' }}>Schritt hinzufügen</Button></Stack>;
}
