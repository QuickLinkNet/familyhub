import { useEffect, useState, type FormEvent } from 'react';
import { PersonRounded } from '@mui/icons-material';
import { Alert, Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material';
import { ApiError } from '../../../services/apiClient';
import { useFamilyMembers } from '../../family/hooks/useFamilyMembers';
import { useCreateTask } from '../hooks/useTasks';
import type { CreateTaskInput, RoutinePeriod, TaskPriority } from '../types/task';
import { RoutineDayPicker } from './RoutineDayPicker';

export type TaskDialogMode = 'TASK' | 'ROUTINE';

const priorityLabels: Record<TaskPriority, string> = { LOW: 'Niedrig', MEDIUM: 'Mittel', HIGH: 'Hoch' };
const periodLabels: Record<RoutinePeriod, string> = { MORNING: 'Morgen', AFTERNOON: 'Nachmittag', EVENING: 'Abend' };
const emptyTask = (mode: TaskDialogMode): CreateTaskInput => ({
  title: '', description: '', assignedMemberId: null, dueDate: null, priority: 'MEDIUM', requiresVerification: false,
  routinePeriod: mode === 'ROUTINE' ? 'MORNING' : null,
  repeatDays: mode === 'ROUTINE' ? [1, 2, 3, 4, 5] : [],
});

interface AddTaskDialogProps {
  open: boolean;
  mode: TaskDialogMode;
  onClose: () => void;
}

export function AddTaskDialog({ open, mode, onClose }: AddTaskDialogProps) {
  const create = useCreateTask();
  const members = useFamilyMembers();
  const [form, setForm] = useState<CreateTaskInput>(() => emptyTask(mode));
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { if (open) { setForm(emptyTask(mode)); setError(null); } }, [mode, open]);
  const update = <K extends keyof CreateTaskInput>(key: K, value: CreateTaskInput[K]) => setForm(current => ({ ...current, [key]: value }));
  const close = () => { if (!create.isPending) { setError(null); onClose(); } };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    try {
      await create.mutateAsync(form);
      onClose();
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Die Aufgabe konnte nicht gespeichert werden.');
    }
  };
  const isRoutine = mode === 'ROUTINE';

  return (
    <Dialog open={open} onClose={close} fullWidth maxWidth="sm" PaperProps={{ component: 'form', onSubmit: submit }}>
      <DialogTitle>{isRoutine ? 'Routine hinzufügen' : 'Aufgabe hinzufügen'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2.25} pt={1}>
          {error && <Alert severity="error">{error}</Alert>}
          {isRoutine && <Alert severity="info">Nach dem Abhaken legt FamilyHub automatisch die nächste passende Routine an.</Alert>}
          <TextField autoFocus required label={isRoutine ? 'Was gehört zur Routine?' : 'Was ist zu tun?'} value={form.title} onChange={event => update('title', event.target.value)} inputProps={{ maxLength: 140 }} fullWidth />
          <TextField label="Beschreibung (optional)" value={form.description ?? ''} onChange={event => update('description', event.target.value)} multiline minRows={2} inputProps={{ maxLength: 2000 }} fullWidth />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.25 }}>
            <FormControl fullWidth>
              <InputLabel id="task-assignee-label">Zugeordnet an</InputLabel>
              <Select labelId="task-assignee-label" label="Zugeordnet an" value={form.assignedMemberId ?? ''} onChange={event => update('assignedMemberId', event.target.value || null)} startAdornment={<PersonRounded sx={{ ml: 1, mr: 0.5 }} fontSize="small" />}>
                <MenuItem value="">Nicht zugeordnet</MenuItem>
                {members.data?.filter(member => member.isActive).map(member => <MenuItem key={member.id} value={member.id}>{member.name}</MenuItem>)}
              </Select>
            </FormControl>
            {isRoutine ? (
              <FormControl fullWidth>
                <InputLabel id="routine-period-label">Tageszeit</InputLabel>
                <Select labelId="routine-period-label" label="Tageszeit" value={form.routinePeriod ?? 'MORNING'} onChange={event => update('routinePeriod', event.target.value as RoutinePeriod)}>
                  {(Object.keys(periodLabels) as RoutinePeriod[]).map(period => <MenuItem key={period} value={period}>{periodLabels[period]}</MenuItem>)}
                </Select>
              </FormControl>
            ) : <TextField label="Fällig am" type="date" value={form.dueDate ?? ''} onChange={event => update('dueDate', event.target.value || null)} slotProps={{ inputLabel: { shrink: true } }} fullWidth />}
          </Box>
          {isRoutine && <RoutineDayPicker value={form.repeatDays ?? []} onChange={days => update('repeatDays', days)} />}
          <FormControl fullWidth>
            <InputLabel id="task-priority-label">Priorität</InputLabel>
            <Select labelId="task-priority-label" label="Priorität" value={form.priority} onChange={event => update('priority', event.target.value as TaskPriority)}>
              {(Object.keys(priorityLabels) as TaskPriority[]).map(priority => <MenuItem key={priority} value={priority}>{priorityLabels[priority]}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControlLabel control={<Checkbox checked={form.requiresVerification} onChange={event => update('requiresVerification', event.target.checked)} />} label="Erledigung muss von Eltern bestätigt werden" />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2.5, pt: 1.5 }}>
        <Button onClick={close}>Abbrechen</Button>
        <Button type="submit" variant="contained" disabled={create.isPending || !form.title.trim() || (isRoutine && (form.repeatDays?.length ?? 0) === 0)}>{create.isPending ? 'Wird gespeichert …' : 'Hinzufügen'}</Button>
      </DialogActions>
    </Dialog>
  );
}
