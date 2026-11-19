import { AccessTimeRounded, AddShoppingCartRounded, DeleteOutlineRounded, EditRounded, GroupRounded } from '@mui/icons-material';
import { Box, Button, Card, CardContent, Chip, IconButton, Stack, Typography } from '@mui/material';
import type { MealRecipe } from '../types/meal';
import { recipeCategoryMeta } from '../constants/meals';

export function RecipeCard({ recipe, canManage, onShopping, onEdit, onDelete }: { recipe: MealRecipe; canManage: boolean; onShopping: () => void; onEdit: () => void; onDelete: () => void }) {
  const category = recipeCategoryMeta[recipe.category];
  return <Card component="article" sx={{ height: '100%', borderTop: `6px solid ${recipe.color}` }}><CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
    <Stack direction="row" justifyContent="space-between"><Box sx={{ width: 58, height: 58, display: 'grid', placeItems: 'center', borderRadius: 3, bgcolor: `${recipe.color}22`, fontSize: 34 }}>{recipe.icon}</Box>{canManage && <Stack direction="row"><IconButton aria-label={`${recipe.title} bearbeiten`} onClick={onEdit}><EditRounded /></IconButton><IconButton aria-label={`${recipe.title} löschen`} color="error" onClick={onDelete}><DeleteOutlineRounded /></IconButton></Stack>}</Stack>
    <Typography variant="h5" mt={1.5}>{recipe.title}</Typography>{recipe.description && <Typography color="text.secondary" mt={0.5}>{recipe.description}</Typography>}
    <Stack direction="row" gap={0.75} mt={1.25} flexWrap="wrap"><Chip size="small" label={`${category.icon} ${category.label}`} />{recipe.prepMinutes && <Chip size="small" icon={<AccessTimeRounded />} label={`${recipe.prepMinutes} Min.`} />}<Chip size="small" icon={<GroupRounded />} label={`${recipe.servings} Portionen`} /><Chip size="small" label={`${recipe.ingredients.length} Zutaten`} />{recipe.instructions.length > 0 && <Chip size="small" label={`${recipe.instructions.length} Schritte`} />}</Stack>
    <Button fullWidth variant="outlined" startIcon={<AddShoppingCartRounded />} onClick={onShopping} disabled={recipe.ingredients.length === 0} sx={{ mt: 1.75 }}>Zutaten zum Einkauf</Button>
  </CardContent></Card>;
}
