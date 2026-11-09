import { SchoolRounded } from '@mui/icons-material';
import { Button, Chip, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { DashboardCard } from '../../../components/molecules/DashboardCard';
import type { SchoolBoard } from '../../school/types/school';
import { shortDate } from '../../school/utils/schoolDates';

export function SchoolSummaryCard({ board, loading, error }: { board?: SchoolBoard; loading: boolean; error: boolean }) {
  const open = board?.items.filter(item => item.completedAt === null) ?? []; const next = open[0]; const weekday = new Date().getDay() || 7; const todayLessons = board?.lessons.filter(lesson => lesson.weekday === weekday) ?? [];
  return <DashboardCard title="Schule" icon={<SchoolRounded color="primary" />} accent="#5B7DB1"><Stack direction="row" alignItems="baseline" gap={1}><Typography variant="h3">{loading || error ? '–' : open.length}</Typography><Typography color="text.secondary">Einträge offen</Typography></Stack>{error ? <Typography color="text.secondary" mt={1}>Schulübersicht nicht erreichbar</Typography> : next ? <Stack mt={1} spacing={1}><Typography fontWeight={800}>{next.subject}: {next.title}</Typography><Stack direction="row" gap={1} alignItems="center"><Chip size="small" label={shortDate(next.dueDate)} /><Typography variant="body2" color="text.secondary">Heute {todayLessons.length} {todayLessons.length === 1 ? 'Stunde' : 'Stunden'}</Typography></Stack></Stack> : <Typography color="text.secondary" mt={1}>{todayLessons.length > 0 ? `Heute stehen ${todayLessons.length} Stunden im Plan.` : 'Alles erledigt und heute kein Unterricht eingetragen.'}</Typography>}<Button component={Link} to="/school" sx={{ mt: 1 }}>Schule öffnen</Button></DashboardCard>;
}
