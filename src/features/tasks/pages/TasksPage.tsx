import { useState, type FormEvent } from 'react';
import { AddRounded, EventRounded, PersonRounded, TaskAltRounded } from '@mui/icons-material';
import { Alert, Avatar, Box, Button, Card, CardContent, Checkbox, Chip, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, InputLabel, MenuItem, Select, Skeleton, Stack, TextField, Typography } from '@mui/material';
import { ApiError } from '../../../services/apiClient';
import { useAuthSession } from '../../auth/hooks/useAuth';
import { useFamilyMembers } from '../../family/hooks/useFamilyMembers';
import { useCompleteTask, useCreateTask, useTasks } from '../hooks/useTasks';
import type { CreateTaskInput, Task, TaskPriority } from '../types/task';

const priorityLabels: Record<TaskPriority, string> = { LOW: 'Niedrig', MEDIUM: 'Mittel', HIGH: 'Hoch' };
const priorityColors: Record<TaskPriority, 'default' | 'warning' | 'error'> = { LOW: 'default', MEDIUM: 'warning', HIGH: 'error' };
const dateLabel = (date: string | null) => date === null ? null : new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'short' }).format(new Date(`${date}T12:00:00`));

export function TasksPage() {
  const tasks = useTasks();
  const session = useAuthSession();
  const [dialogOpen, setDialogOpen] = useState(false);
  const user = session.data?.user ?? null;
  const canManage = user?.role !== 'CHILD';

  return <Stack spacing={{ xs: 2.5, md: 3.5 }}>
    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} gap={2}>
      <Box><Typography variant="h3" sx={{ fontSize: { xs: '2.15rem', md: '3.1rem' } }}>Aufgaben</Typography><Typography color="text.secondary" mt={0.5}>Was heute ansteht – klar verteilt und leicht erledigt.</Typography></Box>
      {canManage && <Button variant="contained" startIcon={<AddRounded />} onClick={() => setDialogOpen(true)}>Aufgabe hinzufügen</Button>}
    </Stack>

    {tasks.isError && <Alert severity="error">{tasks.error instanceof ApiError ? tasks.error.message : 'Die Aufgaben konnten nicht geladen werden.'}</Alert>}
    {tasks.isLoading
      ? <Stack spacing={1.5}>{[0, 1, 2].map(index => <Skeleton key={index} variant="rounded" height={112} />)}</Stack>
      : tasks.data?.length === 0
        ? <EmptyTasks onAdd={canManage ? () => setDialogOpen(true) : undefined} />
        : <Stack spacing={1.5}>{tasks.data?.map(task => <TaskCard key={task.id} task={task} userId={user?.id ?? null} userRole={user?.role ?? null} />)}</Stack>}

    {canManage && <AddTaskDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />}
  </Stack>;
}

function TaskCard({ task, userId, userRole }: { task: Task; userId: string | null; userRole: 'ADMIN' | 'PARENT' | 'CHILD' | null }) {
  const complete = useCompleteTask();
  const done = task.status !== 'OPEN';
  const allowed = userRole !== 'CHILD' || task.assignedMember?.id === userId;
  const completeTask = () => {
    if (!done && allowed) {
      complete.mutate(task.id);
    }
  };

  return <Card component="article" sx={{ opacity: task.status === 'COMPLETED' ? 0.68 : 1, transition: 'opacity 180ms ease' }}>
    <CardContent sx={{ p: { xs: 1.75, sm: 2 }, '&:last-child': { pb: { xs: 1.75, sm: 2 } } }}>
      <Stack direction="row" gap={{ xs: 1, sm: 1.5 }} alignItems="flex-start">
        <Checkbox checked={done} disabled={done || complete.isPending || !allowed} onChange={completeTask} inputProps={{ 'aria-label': allowed ? `${task.title} als erledigt markieren` : `${task.title} ist einer anderen Person zugeordnet` }} sx={{ mt: 0.25, minWidth: 48, minHeight: 48 }} />
        <Box sx={{ minWidth: 0, flex: 1, py: 0.5 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1}>
            <Box><Typography variant="h6" sx={{ textDecoration: task.status === 'COMPLETED' ? 'line-through' : 'none' }}>{task.title}</Typography>{task.description && <Typography color="text.secondary" mt={0.25}>{task.description}</Typography>}</Box>
            <Stack direction="row" gap={0.75} flexWrap="wrap"><Chip size="small" label={priorityLabels[task.priority]} color={priorityColors[task.priority]} />{task.status === 'PENDING_VERIFICATION' && <Chip size="small" color="warning" label="Bitte bestätigen" />}</Stack>
          </Stack>
          <Stack direction="row" gap={1.5} mt={1.5} flexWrap="wrap" color="text.secondary" alignItems="center">
            {task.assignedMember && <Stack direction="row" gap={0.6} alignItems="center"><Avatar sx={{ width: 24, height: 24, fontSize: '0.7rem', bgcolor: task.assignedMember.color ?? 'primary.main' }}>{task.assignedMember.name?.[0] ?? '?'}</Avatar><Typography variant="body2">{task.assignedMember.name}</Typography></Stack>}
            {task.dueDate && <Stack direction="row" gap={0.5} alignItems="center"><EventRounded fontSize="small" /><Typography variant="body2">Fällig {dateLabel(task.dueDate)}</Typography></Stack>}
            {task.requiresVerification && <Typography variant="body2">Eltern-Check</Typography>}
            {!allowed && <Typography variant="body2">Nur von {task.assignedMember?.name ?? 'der zugeordneten Person'} abschließbar</Typography>}
          </Stack>
          {complete.isError && <Alert severity="error" sx={{ mt: 1.5 }}>{complete.error instanceof ApiError ? complete.error.message : 'Die Aufgabe konnte nicht abgeschlossen werden.'}</Alert>}
        </Box>
      </Stack>
    </CardContent>
  </Card>;
}

function EmptyTasks({ onAdd }: { onAdd?: () => void }) {
  return <Card><CardContent sx={{ p: { xs: 3, md: 5 }, textAlign: 'center' }}><TaskAltRounded color="primary" sx={{ fontSize: 56 }} /><Typography variant="h5" mt={1.5}>Der Tag kann starten</Typography><Typography color="text.secondary" mt={1}>{onAdd ? 'Lege die ersten Familienaufgaben an und teile sie direkt zu.' : 'Aktuell sind keine Aufgaben für die Familie offen.'}</Typography>{onAdd && <Button variant="contained" sx={{ mt: 3 }} onClick={onAdd}>Erste Aufgabe hinzufügen</Button>}</CardContent></Card>;
}

function AddTaskDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const create = useCreateTask();
  const members = useFamilyMembers();
  const [form, setForm] = useState<CreateTaskInput>({ title: '', description: '', assignedMemberId: null, dueDate: null, priority: 'MEDIUM', requiresVerification: false });
  const [error, setError] = useState<string | null>(null);
  const update = <K extends keyof CreateTaskInput>(key: K, value: CreateTaskInput[K]) => setForm(current => ({ ...current, [key]: value }));
  const close = () => {
    if (!create.isPending) {
      setError(null);
      onClose();
    }
  };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    try {
      await create.mutateAsync(form);
      setForm({ title: '', description: '', assignedMemberId: null, dueDate: null, priority: 'MEDIUM', requiresVerification: false });
      onClose();
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Die Aufgabe konnte nicht gespeichert werden.');
    }
  };

  return <Dialog open={open} onClose={close} fullWidth maxWidth="sm" PaperProps={{ component: 'form', onSubmit: submit }}>
    <DialogTitle>Aufgabe hinzufügen</DialogTitle>
    <DialogContent>
      <Stack spacing={2.25} pt={1}>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField autoFocus required label="Was ist zu tun?" value={form.title} onChange={event => update('title', event.target.value)} inputProps={{ maxLength: 140 }} fullWidth />
        <TextField label="Beschreibung (optional)" value={form.description ?? ''} onChange={event => update('description', event.target.value)} multiline minRows={2} inputProps={{ maxLength: 2000 }} fullWidth />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.25 }}>
          <FormControl fullWidth><InputLabel id="task-assignee-label">Zugeordnet an</InputLabel><Select labelId="task-assignee-label" label="Zugeordnet an" value={form.assignedMemberId ?? ''} onChange={event => update('assignedMemberId', event.target.value || null)} startAdornment={<PersonRounded sx={{ ml: 1, mr: 0.5 }} fontSize="small" />}><MenuItem value="">Nicht zugeordnet</MenuItem>{members.data?.filter(member => member.isActive).map(member => <MenuItem key={member.id} value={member.id}>{member.name}</MenuItem>)}</Select></FormControl>
          <TextField label="Fällig am" type="date" value={form.dueDate ?? ''} onChange={event => update('dueDate', event.target.value || null)} slotProps={{ inputLabel: { shrink: true } }} fullWidth />
        </Box>
        <FormControl fullWidth><InputLabel id="task-priority-label">Priorität</InputLabel><Select labelId="task-priority-label" label="Priorität" value={form.priority} onChange={event => update('priority', event.target.value as TaskPriority)}>{(Object.keys(priorityLabels) as TaskPriority[]).map(priority => <MenuItem key={priority} value={priority}>{priorityLabels[priority]}</MenuItem>)}</Select></FormControl>
        <FormControlLabel control={<Checkbox checked={form.requiresVerification} onChange={event => update('requiresVerification', event.target.checked)} />} label="Erledigung muss von Eltern bestätigt werden" />
      </Stack>
    </DialogContent>
    <DialogActions sx={{ p: 2.5, pt: 1.5 }}><Button onClick={close}>Abbrechen</Button><Button type="submit" variant="contained" disabled={create.isPending}>{create.isPending ? 'Wird gespeichert …' : 'Hinzufügen'}</Button></DialogActions>
  </Dialog>;
}
