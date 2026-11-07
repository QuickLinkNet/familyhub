import { AddRounded, DeleteOutlineRounded } from '@mui/icons-material';
import { Button, FormControl, IconButton, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material';
import { categoryMeta, shoppingCategories } from '../../shopping/constants/categories';
import type { RecipeIngredient } from '../types/meal';
import type { ShoppingCategory } from '../../shopping/types/shopping';

export function RecipeIngredientFields({ value, onChange }: { value: RecipeIngredient[]; onChange: (value: RecipeIngredient[]) => void }) {
  const update = (index: number, patch: Partial<RecipeIngredient>) => onChange(value.map((ingredient, current) => current === index ? { ...ingredient, ...patch } : ingredient));
  const remove = (index: number) => onChange(value.filter((_, current) => current !== index));
  return <Stack gap={1.25}>{value.map((ingredient, index) => <Stack key={index} direction={{ xs: 'column', sm: 'row' }} gap={1} alignItems={{ sm: 'center' }}>
    <TextField label="Zutat" value={ingredient.name} onChange={event => update(index, { name: event.target.value })} inputProps={{ maxLength: 100 }} sx={{ flex: 2 }} />
    <TextField label="Menge" value={ingredient.quantity} onChange={event => update(index, { quantity: event.target.value })} inputProps={{ maxLength: 30 }} sx={{ flex: 1 }} />
    <FormControl sx={{ flex: 1.3, minWidth: 140 }}><InputLabel id={`ingredient-category-${index}`}>Bereich</InputLabel><Select labelId={`ingredient-category-${index}`} label="Bereich" value={ingredient.category} onChange={event => update(index, { category: event.target.value as ShoppingCategory })}>{shoppingCategories.map(category => <MenuItem key={category} value={category}>{categoryMeta[category].icon} {categoryMeta[category].label}</MenuItem>)}</Select></FormControl>
    <IconButton aria-label="Zutat entfernen" onClick={() => remove(index)}><DeleteOutlineRounded /></IconButton>
  </Stack>)}<Button startIcon={<AddRounded />} onClick={() => onChange([...value, { name: '', quantity: '', category: 'OTHER' }])} disabled={value.length >= 50} sx={{ alignSelf: 'flex-start' }}>Zutat hinzufügen</Button></Stack>;
}
