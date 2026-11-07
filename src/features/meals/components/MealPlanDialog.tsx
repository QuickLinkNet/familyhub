import { useEffect, useState, type FormEvent } from 'react';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material';
import { ApiError } from '../../../services/apiClient';
import { mealMeta, mealTypes } from '../constants/meals';
import { usePlanMeal } from '../hooks/useMeals';
import type { MealRecipe, MealType } from '../types/meal';

interface PlanTarget { date: string; mealType: MealType; }
export function MealPlanDialog({ target, recipes, onClose }: { target: PlanTarget | null; recipes: MealRecipe[]; onClose: () => void }) {
  const plan = usePlanMeal(); const [type, setType] = useState<MealType>('DINNER'); const [recipeId, setRecipeId] = useState(''); const [title, setTitle] = useState(''); const [note, setNote] = useState(''); const [error, setError] = useState<string | null>(null);
  useEffect(() => { if (target) { setType(target.mealType); setRecipeId(''); setTitle(''); setNote(''); setError(null); } }, [target]);
  const submit = async (event: FormEvent) => { event.preventDefault(); if (!target) return; setError(null); try { await plan.mutateAsync({ date: target.date, mealType: type, recipeId: recipeId || null, title, note }); onClose(); } catch (cause) { setError(cause instanceof ApiError ? cause.message : 'Die Mahlzeit konnte nicht geplant werden.'); } };
  return <Dialog open={target !== null} onClose={onClose} fullWidth maxWidth="xs" PaperProps={{ component: 'form', onSubmit: submit }}><DialogTitle>Mahlzeit planen</DialogTitle><DialogContent><Stack spacing={2.25} pt={1}>{error && <Alert severity="error">{error}</Alert>}
    <TextField label="Datum" type="date" value={target?.date ?? ''} disabled slotProps={{ inputLabel: { shrink: true } }} />
    <FormControl><InputLabel id="meal-type-label">Mahlzeit</InputLabel><Select labelId="meal-type-label" label="Mahlzeit" value={type} onChange={event => setType(event.target.value as MealType)}>{mealTypes.map(value => <MenuItem key={value} value={value}>{mealMeta[value].icon} {mealMeta[value].label}</MenuItem>)}</Select></FormControl>
    <FormControl><InputLabel id="meal-recipe-label">Lieblingsgericht</InputLabel><Select labelId="meal-recipe-label" label="Lieblingsgericht" value={recipeId} onChange={event => setRecipeId(event.target.value)}><MenuItem value="">Eigenes Gericht eingeben</MenuItem>{recipes.map(recipe => <MenuItem key={recipe.id} value={recipe.id}>{recipe.icon} {recipe.title}</MenuItem>)}</Select></FormControl>
    {!recipeId && <TextField autoFocus required label="Was gibt es?" value={title} onChange={event => setTitle(event.target.value)} inputProps={{ maxLength: 100 }} />}
    <TextField label="Hinweis (optional)" value={note} onChange={event => setNote(event.target.value)} inputProps={{ maxLength: 300 }} placeholder="z. B. Oma isst mit" />
  </Stack></DialogContent><DialogActions sx={{ p: 2.5 }}><Button onClick={onClose}>Abbrechen</Button><Button type="submit" variant="contained" disabled={plan.isPending || (!recipeId && title.trim().length < 2)}>Einplanen</Button></DialogActions></Dialog>;
}
