import { useState } from 'react';
import { AddRounded, TaskAltRounded } from '@mui/icons-material';
import { Alert, Button, Skeleton, Stack } from '@mui/material';
import { EmptyStateCard } from '../../../components/molecules/EmptyStateCard';
import { PageHeader } from '../../../components/molecules/PageHeader';
import { ApiError } from '../../../services/apiClient';
import { useAuthSession } from '../../auth/hooks/useAuth';
import { AddTaskDialog } from '../components/AddTaskDialog';
import { TaskCard } from '../components/TaskCard';
import { useTasks } from '../hooks/useTasks';

export function TasksPage() {
  const tasks = useTasks();
  const session = useAuthSession();
  const [dialogOpen, setDialogOpen] = useState(false);
  const user = session.data?.user ?? null;
  const canManage = user?.role !== 'CHILD';
  const addButton = canManage ? <Button variant="contained" startIcon={<AddRounded />} onClick={() => setDialogOpen(true)}>Aufgabe hinzufügen</Button> : undefined;

  return (
    <Stack spacing={{ xs: 2.5, md: 3.5 }}>
      <PageHeader title="Aufgaben" description="Was heute ansteht – klar verteilt und leicht erledigt." actions={addButton} />
      {tasks.isError && <Alert severity="error">{tasks.error instanceof ApiError ? tasks.error.message : 'Die Aufgaben konnten nicht geladen werden.'}</Alert>}
      {tasks.isLoading
        ? <Stack spacing={1.5}>{[0, 1, 2].map(index => <Skeleton key={index} variant="rounded" height={112} />)}</Stack>
        : tasks.data?.length === 0
          ? <EmptyStateCard icon={<TaskAltRounded color="primary" sx={{ fontSize: 56 }} />} title="Der Tag kann starten" description={canManage ? 'Lege die ersten Familienaufgaben an und teile sie direkt zu.' : 'Aktuell sind keine Aufgaben für die Familie offen.'} action={canManage ? <Button variant="contained" sx={{ mt: 2 }} onClick={() => setDialogOpen(true)}>Erste Aufgabe hinzufügen</Button> : undefined} />
          : <Stack spacing={1.5}>{tasks.data?.map(task => <TaskCard key={task.id} task={task} userId={user?.id ?? null} userRole={user?.role ?? null} />)}</Stack>}
      {canManage && <AddTaskDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />}
    </Stack>
  );
}
