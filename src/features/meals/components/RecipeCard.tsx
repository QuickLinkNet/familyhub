import { AccessTimeRounded, AddShoppingCartRounded, DeleteOutlineRounded } from '@mui/icons-material';
import { Box, Button, Card, CardContent, Chip, IconButton, Stack, Typography } from '@mui/material';
import type { MealRecipe } from '../types/meal';

export function RecipeCard({ recipe, canManage, onShopping, onDelete }: { recipe: MealRecipe; canManage: boolean; onShopping: () => void; onDelete: () => void }) {
  return <Card component="article" sx={{ height: '100%', borderTop: `6px solid ${recipe.color}` }}><CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
    <Stack direction="row" justifyContent="space-between"><Box sx={{ width: 58, height: 58, display: 'grid', placeItems: 'center', borderRadius: 3, bgcolor: `${recipe.color}22`, fontSize: 34 }}>{recipe.icon}</Box>{canManage && <IconButton aria-label={`${recipe.title} löschen`} color="error" onClick={onDelete}><DeleteOutlineRounded /></IconButton>}</Stack>
    <Typography variant="h5" mt={1.5}>{recipe.title}</Typography>{recipe.description && <Typography color="text.secondary" mt={0.5}>{recipe.description}</Typography>}
    <Stack direction="row" gap={0.75} mt={1.25} flexWrap="wrap">{recipe.prepMinutes && <Chip size="small" icon={<AccessTimeRounded />} label={`${recipe.prepMinutes} Min.`} />}{<Chip size="small" label={`${recipe.ingredients.length} Zutaten`} />}</Stack>
    <Button fullWidth variant="outlined" startIcon={<AddShoppingCartRounded />} onClick={onShopping} disabled={recipe.ingredients.length === 0} sx={{ mt: 1.75 }}>Zutaten zum Einkauf</Button>
  </CardContent></Card>;
}
