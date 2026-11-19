import { useEffect, useState, type FormEvent } from 'react';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import { ApiError } from '../../../services/apiClient';
import type { ShoppingList } from '../../shopping/types/shopping';
import { useAddRecipeToShopping } from '../hooks/useMeals';
import type { MealRecipe } from '../types/meal';

export function ShoppingTransferDialog({ recipe, lists, onClose }: { recipe: MealRecipe | null; lists: ShoppingList[]; onClose: () => void }) {
  const transfer = useAddRecipeToShopping(); const [listId, setListId] = useState(''); const [servings, setServings] = useState(4); const [error, setError] = useState<string | null>(null); const [success, setSuccess] = useState<string | null>(null);
  useEffect(() => { if (recipe) { setListId(lists[0]?.id ?? ''); setServings(recipe.servings); setError(null); setSuccess(null); } }, [lists, recipe]);
  const submit = async (event: FormEvent) => { event.preventDefault(); if (!recipe) return; setError(null); try { const result = await transfer.mutateAsync({ recipeId: recipe.id, listId, servings }); setSuccess(`${result.addedCount} Zutaten für ${result.servings} Portionen wurden hinzugefügt.`); } catch (cause) { setError(cause instanceof ApiError ? cause.message : 'Die Zutaten konnten nicht übertragen werden.'); } };
  return <Dialog open={recipe !== null} onClose={onClose} fullWidth maxWidth="xs" PaperProps={{ component: 'form', onSubmit: submit }}><DialogTitle>{recipe?.icon} Zutaten übernehmen</DialogTitle><DialogContent><Stack spacing={2} pt={1}>{error && <Alert severity="error">{error}</Alert>}{success && <Alert severity="success">{success}</Alert>}
    <Typography>Alle {recipe?.ingredients.length ?? 0} Zutaten für „{recipe?.title}“ werden passend zur gewünschten Portionszahl skaliert.</Typography>
    <TextField type="number" label="Portionen" value={servings} onChange={event => setServings(Number(event.target.value))} inputProps={{ min: 1, max: 50 }} helperText={`Rezeptbasis: ${recipe?.servings ?? 0} Portionen`} />
    {lists.length === 0 ? <Alert severity="info">Lege zuerst im Bereich Einkauf eine Liste an.</Alert> : <FormControl><InputLabel id="transfer-list-label">Einkaufsliste</InputLabel><Select labelId="transfer-list-label" label="Einkaufsliste" value={listId} onChange={event => setListId(event.target.value)}>{lists.map(list => <MenuItem key={list.id} value={list.id}>{list.icon} {list.name}</MenuItem>)}</Select></FormControl>}
  </Stack></DialogContent><DialogActions sx={{ p: 2.5 }}><Button onClick={onClose}>{success ? 'Fertig' : 'Abbrechen'}</Button>{!success && <Button type="submit" variant="contained" disabled={transfer.isPending || !listId || servings < 1 || servings > 50}>Übernehmen</Button>}</DialogActions></Dialog>;
}
