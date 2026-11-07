import { useEffect, useState, type FormEvent } from 'react';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, Stack, Typography } from '@mui/material';
import { ApiError } from '../../../services/apiClient';
import type { ShoppingList } from '../../shopping/types/shopping';
import { useAddRecipeToShopping } from '../hooks/useMeals';
import type { MealRecipe } from '../types/meal';

export function ShoppingTransferDialog({ recipe, lists, onClose }: { recipe: MealRecipe | null; lists: ShoppingList[]; onClose: () => void }) {
  const transfer = useAddRecipeToShopping(); const [listId, setListId] = useState(''); const [error, setError] = useState<string | null>(null); const [success, setSuccess] = useState<string | null>(null);
  useEffect(() => { if (recipe) { setListId(lists[0]?.id ?? ''); setError(null); setSuccess(null); } }, [lists, recipe]);
  const submit = async (event: FormEvent) => { event.preventDefault(); if (!recipe) return; setError(null); try { const result = await transfer.mutateAsync({ recipeId: recipe.id, listId }); setSuccess(`${result.addedCount} Zutaten wurden hinzugefügt.`); } catch (cause) { setError(cause instanceof ApiError ? cause.message : 'Die Zutaten konnten nicht übertragen werden.'); } };
  return <Dialog open={recipe !== null} onClose={onClose} fullWidth maxWidth="xs" PaperProps={{ component: 'form', onSubmit: submit }}><DialogTitle>{recipe?.icon} Zutaten übernehmen</DialogTitle><DialogContent><Stack spacing={2} pt={1}>{error && <Alert severity="error">{error}</Alert>}{success && <Alert severity="success">{success}</Alert>}
    <Typography>Alle {recipe?.ingredients.length ?? 0} Zutaten für „{recipe?.title}“ werden als einzelne Artikel ergänzt.</Typography>
    {lists.length === 0 ? <Alert severity="info">Lege zuerst im Bereich Einkauf eine Liste an.</Alert> : <FormControl><InputLabel id="transfer-list-label">Einkaufsliste</InputLabel><Select labelId="transfer-list-label" label="Einkaufsliste" value={listId} onChange={event => setListId(event.target.value)}>{lists.map(list => <MenuItem key={list.id} value={list.id}>{list.icon} {list.name}</MenuItem>)}</Select></FormControl>}
  </Stack></DialogContent><DialogActions sx={{ p: 2.5 }}><Button onClick={onClose}>{success ? 'Fertig' : 'Abbrechen'}</Button>{!success && <Button type="submit" variant="contained" disabled={transfer.isPending || !listId}>Übernehmen</Button>}</DialogActions></Dialog>;
}
