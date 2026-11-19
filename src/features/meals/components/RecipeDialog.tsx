import { useEffect, useState, type FormEvent } from 'react';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { ApiError } from '../../../services/apiClient';
import { recipeCategories, recipeCategoryMeta, recipeColors, recipeIcons } from '../constants/meals';
import { useCreateRecipe, useUpdateRecipe } from '../hooks/useMeals';
import type { MealRecipe, RecipeCategory, RecipeInput } from '../types/meal';
import { RecipeIngredientFields } from './RecipeIngredientFields';
import { RecipeStepFields } from './RecipeStepFields';

const empty = (): RecipeInput => ({
  title: '', description: '', icon: recipeIcons[0], color: recipeColors[0], prepMinutes: '', servings: 4,
  category: 'MAIN', ingredients: [{ name: '', quantity: '', category: 'OTHER' }], instructions: ['']
});

const fromRecipe = (recipe: MealRecipe): RecipeInput => ({
  title: recipe.title, description: recipe.description ?? '', icon: recipe.icon, color: recipe.color,
  prepMinutes: recipe.prepMinutes ?? '', servings: recipe.servings, category: recipe.category,
  ingredients: recipe.ingredients.map(({ name, quantity, category }) => ({ name, quantity: quantity ?? '', category })),
  instructions: recipe.instructions.length > 0 ? [...recipe.instructions] : ['']
});

export function RecipeDialog({ open, recipe, onClose }: { open: boolean; recipe?: MealRecipe; onClose: () => void }) {
  const create = useCreateRecipe(); const update = useUpdateRecipe(); const [form, setForm] = useState<RecipeInput>(empty); const [error, setError] = useState<string | null>(null);
  useEffect(() => { if (open) { setForm(recipe ? fromRecipe(recipe) : empty()); setError(null); } }, [open, recipe]);
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setError(null);
    const input = { ...form, ingredients: form.ingredients.filter(item => item.name.trim()), instructions: form.instructions.filter(step => step.trim()) };
    try { if (recipe) await update.mutateAsync({ id: recipe.id, recipe: input }); else await create.mutateAsync(input); onClose(); }
    catch (cause) { setError(cause instanceof ApiError ? cause.message : 'Das Gericht konnte nicht gespeichert werden.'); }
  };
  const pending = create.isPending || update.isPending;
  return <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" PaperProps={{ component: 'form', onSubmit: submit }}>
    <DialogTitle>{recipe ? 'Lieblingsgericht bearbeiten' : 'Lieblingsgericht anlegen'}</DialogTitle><DialogContent><Stack spacing={2.25} pt={1}>{error && <Alert severity="error">{error}</Alert>}
      <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.5}><TextField autoFocus required label="Name des Gerichts" value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} inputProps={{ maxLength: 100 }} sx={{ flex: 2 }} /><TextField type="number" label="Portionen" value={form.servings} onChange={event => setForm({ ...form, servings: Number(event.target.value) })} inputProps={{ min: 1, max: 50 }} sx={{ flex: 1 }} /><TextField type="number" label="Minuten" value={form.prepMinutes} onChange={event => setForm({ ...form, prepMinutes: event.target.value === '' ? '' : Number(event.target.value) })} inputProps={{ min: 1, max: 1440 }} sx={{ flex: 1 }} /></Stack>
      <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.5}><TextField label="Beschreibung (optional)" value={form.description} onChange={event => setForm({ ...form, description: event.target.value })} multiline minRows={2} inputProps={{ maxLength: 500 }} sx={{ flex: 2 }} /><FormControl sx={{ flex: 1 }}><InputLabel id="recipe-category-label">Kategorie</InputLabel><Select labelId="recipe-category-label" label="Kategorie" value={form.category} onChange={event => setForm({ ...form, category: event.target.value as RecipeCategory })}>{recipeCategories.map(category => <MenuItem key={category} value={category}>{recipeCategoryMeta[category].icon} {recipeCategoryMeta[category].label}</MenuItem>)}</Select></FormControl></Stack>
      <Box><Typography fontWeight={700} mb={1}>Symbol</Typography><ToggleButtonGroup exclusive value={form.icon} onChange={(_, icon) => icon && setForm({ ...form, icon })} sx={{ display: 'flex', flexWrap: 'wrap' }}>{recipeIcons.map(icon => <ToggleButton key={icon} value={icon} sx={{ fontSize: 24, minWidth: 50 }}>{icon}</ToggleButton>)}</ToggleButtonGroup></Box>
      <Box><Typography fontWeight={700} mb={1}>Farbe</Typography><Stack direction="row" gap={1} flexWrap="wrap">{recipeColors.map(color => <Button key={color} aria-label={`Farbe ${color}`} onClick={() => setForm({ ...form, color })} sx={{ minWidth: 48, width: 48, bgcolor: color, border: '4px solid', borderColor: form.color === color ? 'text.primary' : 'transparent', '&:hover': { bgcolor: color } }} />)}</Stack></Box>
      <Box><Typography variant="h6" mb={1}>Zutaten für {form.servings || 1} Portionen</Typography><RecipeIngredientFields value={form.ingredients} onChange={ingredients => setForm({ ...form, ingredients })} /></Box>
      <Box><Typography variant="h6" mb={1}>Zubereitung</Typography><RecipeStepFields value={form.instructions} onChange={instructions => setForm({ ...form, instructions })} /></Box>
    </Stack></DialogContent><DialogActions sx={{ p: 2.5 }}><Button onClick={onClose}>Abbrechen</Button><Button type="submit" variant="contained" disabled={pending || form.title.trim().length < 2 || form.servings < 1}>{recipe ? 'Änderungen speichern' : 'Gericht speichern'}</Button></DialogActions>
  </Dialog>;
}
