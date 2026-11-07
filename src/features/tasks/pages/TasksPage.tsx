import { useMemo, useState } from 'react';
import { AddRounded, BedtimeRounded, LightModeRounded, SettingsRounded, TaskAltRounded, WbTwilightRounded } from '@mui/icons-material';
import { Alert, Button, ButtonGroup, Skeleton, Stack } from '@mui/material';
import { EmptyStateCard } from '../../../components/molecules/EmptyStateCard';
import { PageHeader } from '../../../components/molecules/PageHeader';
import { ApiError } from '../../../services/apiClient';
import { useAuthSession } from '../../auth/hooks/useAuth';
import { RoutineDialog } from '../../routines/components/RoutineDialog';
import { RoutineManagerDialog } from '../../routines/components/RoutineManagerDialog';
import { RoutinePeriodSection } from '../../routines/components/RoutinePeriodSection';
import { useRoutines } from '../../routines/hooks/useRoutines';
import type { RoutineTemplate } from '../../routines/types/routine';
import { TaskDialog } from '../components/TaskDialog';
import { TaskSection } from '../components/TaskSection';
import { useTasks } from '../hooks/useTasks';
import type { RoutinePeriod, Task } from '../types/task';
import { isDueBy, localDate } from '../utils/taskDates';

const periodConfig: Record<RoutinePeriod, { title: string; description: string; icon: typeof LightModeRounded }> = {
  MORNING: { title: 'Morgenroutine', description: 'Ruhig und gut vorbereitet in den Tag.', icon: LightModeRounded },
  AFTERNOON: { title: 'Nachmittagsroutine', description: 'Nach Schule und Arbeit gemeinsam ankommen.', icon: WbTwilightRounded },
  EVENING: { title: 'Abendroutine', description: 'Den Tag entspannt abschließen.', icon: BedtimeRounded },
};

export function TasksPage() {
  const tasks = useTasks();
  const routines = useRoutines();
  const session = useAuthSession();
  const [dialogMode, setDialogMode] = useState<'TASK' | 'ROUTINE' | 'MANAGE' | null>(null);
  const [selectedRoutine, setSelectedRoutine] = useState<RoutineTemplate | null>(null);
  const user = session.data?.user ?? null;
  const canManage = user?.role !== 'CHILD';
  const grouped = useMemo(() => groupTasks(tasks.data ?? [], localDate()), [tasks.data]);
  const actions = canManage ? <Stack direction={{ xs: 'column', sm: 'row' }} gap={1}>
    <ButtonGroup variant="contained" aria-label="Aufgabe oder Routine hinzufügen">
      <Button startIcon={<AddRounded />} onClick={() => setDialogMode('TASK')}>Aufgabe</Button>
      <Button color="secondary" onClick={() => { setSelectedRoutine(null); setDialogMode('ROUTINE'); }}>Routine</Button>
    </ButtonGroup>
    <Button variant="outlined" startIcon={<SettingsRounded />} onClick={() => setDialogMode('MANAGE')}>Verwalten</Button>
  </Stack> : undefined;
  const routineRuns = routines.data?.runs ?? [];

  return (
    <Stack spacing={{ xs: 2.5, md: 3.5 }}>
      <PageHeader title="Aufgaben & Routinen" description="Kleine Schritte, die euren Familienalltag leichter machen." actions={actions} />
      {tasks.isError && <Alert severity="error">{tasks.error instanceof ApiError ? tasks.error.message : 'Die Aufgaben konnten nicht geladen werden.'}</Alert>}
      {routines.isError && <Alert severity="error">{routines.error instanceof ApiError ? routines.error.message : 'Die Routinen konnten nicht geladen werden.'}</Alert>}
      {tasks.isLoading || routines.isLoading ? (
        <Stack spacing={1.5}>{[0, 1, 2].map(index => <Skeleton key={index} variant="rounded" height={112} />)}</Stack>
      ) : grouped.total === 0 && routineRuns.length === 0 ? (
        <EmptyStateCard icon={<TaskAltRounded color="primary" sx={{ fontSize: 56 }} />} title="Der Tag kann starten" description={canManage ? 'Lege eine Aufgabe oder die erste Familienroutine an.' : 'Aktuell sind keine Aufgaben für die Familie offen.'} action={canManage ? <Button variant="contained" sx={{ mt: 2 }} onClick={() => { setSelectedRoutine(null); setDialogMode('ROUTINE'); }}>Erste Routine anlegen</Button> : undefined} />
      ) : (
        <Stack spacing={{ xs: 3, md: 4 }}>
          {(Object.keys(periodConfig) as RoutinePeriod[]).map(period => {
            const config = periodConfig[period];
            const Icon = config.icon;
            return <RoutinePeriodSection key={period} title={config.title} description={config.description} icon={<Icon color="primary" />} runs={routineRuns.filter(run => run.routinePeriod === period)} legacyTasks={grouped.routines[period]} userId={user?.id ?? null} userRole={user?.role ?? null} canManage={canManage} />;
          })}
          <TaskSection title="Weitere Aufgaben" tasks={grouped.tasks} userId={user?.id ?? null} userRole={user?.role ?? null} canManage={canManage} />
          <TaskSection title="Demnächst" description="Bereits geplant, aber heute noch nicht fällig." tasks={grouped.upcoming} userId={user?.id ?? null} userRole={user?.role ?? null} canManage={canManage} />
          <TaskSection title="Zuletzt erledigt" tasks={grouped.completed.slice(0, 5)} userId={user?.id ?? null} userRole={user?.role ?? null} canManage={canManage} />
        </Stack>
      )}
      {canManage && <TaskDialog open={dialogMode === 'TASK'} onClose={() => setDialogMode(null)} />}
      {canManage && <RoutineDialog open={dialogMode === 'ROUTINE'} template={selectedRoutine} onClose={() => { setDialogMode(null); setSelectedRoutine(null); }} />}
      {canManage && <RoutineManagerDialog open={dialogMode === 'MANAGE'} templates={routines.data?.templates ?? []} onEdit={template => { setSelectedRoutine(template); setDialogMode('ROUTINE'); }} onClose={() => setDialogMode(null)} />}
    </Stack>
  );
}

function groupTasks(items: Task[], date: string) {
  const active = items.filter(task => task.status !== 'COMPLETED');
  const due = active.filter(task => isDueBy(task, date));
  const routines = {
    MORNING: due.filter(task => task.routinePeriod === 'MORNING'),
    AFTERNOON: due.filter(task => task.routinePeriod === 'AFTERNOON'),
    EVENING: due.filter(task => task.routinePeriod === 'EVENING'),
  };
  return {
    routines,
    tasks: due.filter(task => !task.routinePeriod),
    upcoming: active.filter(task => task.dueDate !== null && task.dueDate > date),
    completed: items.filter(task => task.status === 'COMPLETED'),
    total: items.length,
  };
}
