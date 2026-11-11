import { CleaningServicesRounded, DeleteOutlineRounded, LocalLaundryServiceRounded, MoreHorizRounded, PetsRounded, YardRounded } from '@mui/icons-material';
import type { HouseholdCategory } from '../types/household';

export function HouseholdCategoryIcon({ category }: { category: HouseholdCategory }) {
  if (category === 'CLEANING') return <CleaningServicesRounded />;
  if (category === 'TRASH') return <DeleteOutlineRounded />;
  if (category === 'PLANTS') return <YardRounded />;
  if (category === 'LAUNDRY') return <LocalLaundryServiceRounded />;
  if (category === 'PETS') return <PetsRounded />;
  return <MoreHorizRounded />;
}
