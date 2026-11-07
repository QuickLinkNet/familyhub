import { AddRounded, MenuBookRounded } from '@mui/icons-material';
import { Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import { PageHeader } from '../../../components/molecules/PageHeader';
import { useAuthSession } from '../../auth/hooks/useAuth';
import { useShoppingLists } from '../../shopping/hooks/useShopping';
import { MealDayCard } from '../components/MealDayCard';
import { MealPlanDialog } from '../components/MealPlanDialog';
import { MealWeekNavigator } from '../components/MealWeekNavigator';
import { RecipeCard } from '../components/RecipeCard';
import { RecipeDialog } from '../components/RecipeDialog';
import { ShoppingTransferDialog } from '../components/ShoppingTransferDialog';
import { useDeleteRecipe, useMealPlanner } from '../hooks/useMeals';
import type { MealRecipe, MealType } from '../types/meal';
import { addDays, localDate, weekDays, weekStart } from '../utils/mealDates';

export function MealsPage() {
  const [start, setStart] = useState(() => weekStart(new Date())); const from = localDate(start); const to = localDate(addDays(start, 6)); const planner = useMealPlanner(from, to); const shopping = useShoppingLists(); const session = useAuthSession(); const removeRecipe = useDeleteRecipe();
  const [recipeOpen, setRecipeOpen] = useState(false); const [target, setTarget] = useState<{ date: string; mealType: MealType } | null>(null); const [transfer, setTransfer] = useState<MealRecipe | null>(null); const [deleting, setDeleting] = useState<MealRecipe | null>(null);
  const days = useMemo(() => weekDays(start), [start]); const canManage = session.data?.user?.role === 'ADMIN' || session.data?.user?.role === 'PARENT';
  if (planner.isLoading) return <Stack alignItems="center" py={8} gap={2}><CircularProgress /><Typography>Wochenplan wird geladen …</Typography></Stack>;
  if (planner.isError || !planner.data) return <Alert severity="error">Der Essensplan konnte nicht geladen werden.</Alert>;
  return <Stack spacing={{ xs: 2.5, md: 3.5 }}>
    <PageHeader title="Essensplan" description="Einmal planen, sieben Tage weniger überlegen." actions={canManage ? <Button variant="contained" startIcon={<AddRounded />} onClick={() => setRecipeOpen(true)}>Lieblingsgericht</Button> : undefined} />
    <MealWeekNavigator start={start} onPrevious={() => setStart(addDays(start, -7))} onNext={() => setStart(addDays(start, 7))} onToday={() => setStart(weekStart(new Date()))} />
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' }, gap: 1.5 }}>{days.map(day => { const date = localDate(day); return <MealDayCard key={date} date={day} entries={planner.data.entries.filter(entry => entry.date === date)} canManage={canManage} onPlan={mealType => setTarget({ date, mealType })} />; })}</Box>
    <Box><Stack direction="row" alignItems="center" gap={1} mb={1.5}><MenuBookRounded color="secondary" /><Typography variant="h5">Lieblingsgerichte</Typography></Stack>
      {planner.data.recipes.length === 0 ? <Alert severity="info">Noch keine Lieblingsgerichte gespeichert. Ihr könnt trotzdem jede Mahlzeit direkt im Wochenplan eintragen.</Alert> : <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' }, gap: 2 }}>{planner.data.recipes.map(recipe => <RecipeCard key={recipe.id} recipe={recipe} canManage={canManage} onShopping={() => setTransfer(recipe)} onDelete={() => setDeleting(recipe)} />)}</Box>}
    </Box>
    <RecipeDialog open={recipeOpen} onClose={() => setRecipeOpen(false)} /><MealPlanDialog target={target} recipes={planner.data.recipes} onClose={() => setTarget(null)} /><ShoppingTransferDialog recipe={transfer} lists={shopping.data ?? []} onClose={() => setTransfer(null)} />
    <Dialog open={deleting !== null} onClose={() => setDeleting(null)}><DialogTitle>Lieblingsgericht löschen?</DialogTitle><DialogContent><Typography>„{deleting?.title}“ verschwindet aus dem Regal. Bereits geplante Einträge behalten ihren Namen.</Typography></DialogContent><DialogActions><Button onClick={() => setDeleting(null)}>Abbrechen</Button><Button color="error" onClick={() => deleting && removeRecipe.mutate(deleting.id, { onSuccess: () => setDeleting(null) })}>Löschen</Button></DialogActions></Dialog>
  </Stack>;
}
