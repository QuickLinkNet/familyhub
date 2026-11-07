import { useEffect, useState, type FormEvent } from 'react';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material';
import { ApiError } from '../../../services/apiClient';
import { useFamilyMembers } from '../../family/hooks/useFamilyMembers';
import { RoutineDayPicker } from '../../tasks/components/RoutineDayPicker';
import type { RoutinePeriod } from '../../tasks/types/task';
import { routinePeriodLabels } from '../constants/routineOptions';
import { useCreateRoutine, useUpdateRoutine } from '../hooks/useRoutines';
import type { RoutineInput, RoutineTemplate } from '../types/routine';
import { RoutineStepFields } from './RoutineStepFields';

const emptyRoutine = (): RoutineInput => ({
  title: '', description: null, assignedMemberId: '', routinePeriod: 'MORNING',
  repeatDays: [1, 2, 3, 4, 5], steps: ['', '']
});

function templateForm(template: RoutineTemplate | null): RoutineInput {
  return template ? {
    title: template.title, description: template.description, assignedMemberId: template.assignedMember.id,
    routinePeriod: template.routinePeriod, repeatDays: template.repeatDays, steps: template.steps.map(step => step.title), isActive: template.isActive
  } : emptyRoutine();
}

interface RoutineDialogProps {
  open: boolean;
  template: RoutineTemplate | null;
  onClose: () => void;
}

export function RoutineDialog({ open, template, onClose }: RoutineDialogProps) {
  const members = useFamilyMembers();
  const create = useCreateRoutine();
  const updateRoutine = useUpdateRoutine();
  const [form, setForm] = useState<RoutineInput>(() => templateForm(template));
  const [error, setError] = useState<string | null>(null);
  const pending = create.isPending || updateRoutine.isPending;

  useEffect(() => { if (open) { setForm(templateForm(template)); setError(null); } }, [open, template]);
  const update = <K extends keyof RoutineInput>(key: K, value: RoutineInput[K]) => setForm(current => ({ ...current, [key]: value }));
  const close = () => { if (!pending) onClose(); };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError(null);
    try {
      if (template) await updateRoutine.mutateAsync({ id: template.id, input: form });
      else await create.mutateAsync(form);
      onClose();
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Die Routine konnte nicht gespeichert werden.');
    }
  };

  return (
    <Dialog open={open} onClose={close} fullWidth maxWidth="md" PaperProps={{ component: 'form', onSubmit: submit }}>
      <DialogTitle>{template ? 'Routine bearbeiten' : 'Mehrstufige Routine anlegen'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} pt={1}>
          {error && <Alert severity="error">{error}</Alert>}
          <Alert severity="info">Jeder Schritt lässt sich einzeln abhaken. Änderungen gelten ab dem nächsten neu erzeugten Tagesablauf.</Alert>
          <TextField autoFocus required label="Name der Routine" value={form.title} onChange={event => update('title', event.target.value)} inputProps={{ maxLength: 100 }} placeholder="Zum Beispiel: Startklar für die Schule" />
          <TextField label="Beschreibung (optional)" value={form.description ?? ''} onChange={event => update('description', event.target.value || null)} multiline minRows={2} inputProps={{ maxLength: 1000 }} />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <FormControl required>
              <InputLabel id="routine-member-label">Für wen?</InputLabel>
              <Select labelId="routine-member-label" label="Für wen?" value={form.assignedMemberId} onChange={event => update('assignedMemberId', event.target.value)}>
                {members.data?.filter(member => member.isActive).map(member => <MenuItem key={member.id} value={member.id}>{member.name}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl required>
              <InputLabel id="workflow-period-label">Tageszeit</InputLabel>
              <Select labelId="workflow-period-label" label="Tageszeit" value={form.routinePeriod} onChange={event => update('routinePeriod', event.target.value as RoutinePeriod)}>
                {(Object.keys(routinePeriodLabels) as RoutinePeriod[]).map(period => <MenuItem key={period} value={period}>{routinePeriodLabels[period]}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
          <RoutineDayPicker value={form.repeatDays} onChange={days => update('repeatDays', days)} />
          <RoutineStepFields steps={form.steps} onChange={steps => update('steps', steps)} />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2.5, pt: 1.5 }}>
        <Button onClick={close}>Abbrechen</Button>
        <Button type="submit" variant="contained" disabled={pending || !form.title.trim() || !form.assignedMemberId || form.repeatDays.length === 0 || form.steps.some(step => step.trim().length < 2)}>{pending ? 'Wird gespeichert …' : 'Routine speichern'}</Button>
      </DialogActions>
    </Dialog>
  );
}
