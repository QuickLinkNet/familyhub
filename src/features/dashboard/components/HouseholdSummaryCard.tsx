import { HomeWorkRounded } from '@mui/icons-material';
import { Button, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { DashboardCard } from '../../../components/molecules/DashboardCard';
import type { HouseholdBoard } from '../../household/types/household';
import { localDate } from '../../household/utils/householdDates';

export function HouseholdSummaryCard({ board, loading, error }: { board?: HouseholdBoard; loading: boolean; error: boolean }) {
  const today = localDate(new Date()); const due = (board?.chores ?? []).filter(chore => chore.nextDueDate <= today); const next = due[0] ?? board?.chores[0];
  return <DashboardCard title="Haushalt" icon={<HomeWorkRounded color="primary" />} accent="#4F8A62"><Stack direction="row" alignItems="baseline" gap={1}><Typography variant="h3">{loading || error ? '–' : due.length}</Typography><Typography color="text.secondary">heute dran</Typography></Stack><Typography color="text.secondary" mt={1}>{error ? 'Haushaltsplan nicht erreichbar' : next ? `${next.assignedMember.name}: ${next.title}` : 'Alles verteilt und gerade nichts offen.'}</Typography><Button component={Link} to="/household" sx={{ mt: 1 }}>Haushalt öffnen</Button></DashboardCard>;
}
