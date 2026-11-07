import { EditRounded, PauseCircleOutlineRounded, PlayCircleOutlineRounded } from '@mui/icons-material';
import { Alert, Button, Card, CardContent, Chip, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, Typography } from '@mui/material';
import { ApiError } from '../../../services/apiClient';
import { repeatDaysLabel, routinePeriodLabels } from '../constants/routineOptions';
import { useDeleteRoutine, useUpdateRoutine } from '../hooks/useRoutines';
import type { RoutineInput, RoutineTemplate } from '../types/routine';

const inputFrom = (template: RoutineTemplate, isActive = template.isActive): RoutineInput => ({
  title: template.title, description: template.description, assignedMemberId: template.assignedMember.id,
  routinePeriod: template.routinePeriod, repeatDays: template.repeatDays, steps: template.steps.map(step => step.title), isActive
});

interface RoutineManagerDialogProps {
  open: boolean;
  templates: RoutineTemplate[];
  onEdit: (template: RoutineTemplate) => void;
  onClose: () => void;
}

export function RoutineManagerDialog({ open, templates, onEdit, onClose }: RoutineManagerDialogProps) {
  const update = useUpdateRoutine();
  const remove = useDeleteRoutine();
  const pending = update.isPending || remove.isPending;
  const error = update.error ?? remove.error;
  const deleteTemplate = (template: RoutineTemplate) => {
    if (window.confirm(`Routine „${template.title}“ wirklich löschen? Bereits erledigte Tagesabläufe bleiben in der Historie.`)) remove.mutate(template.id);
  };

  return (
    <Dialog open={open} onClose={pending ? undefined : onClose} fullWidth maxWidth="md">
      <DialogTitle>Routinen verwalten</DialogTitle>
      <DialogContent>
        <Stack spacing={1.5} pt={1}>
          {error && <Alert severity="error">{error instanceof ApiError ? error.message : 'Die Routine konnte nicht geändert werden.'}</Alert>}
          {templates.length === 0 && <Alert severity="info">Noch keine mehrstufigen Routinen angelegt.</Alert>}
          {templates.map(template => (
            <Card key={template.id} variant="outlined" sx={{ boxShadow: 'none' }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1.5}>
                  <div>
                    <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                      <Typography variant="h6">{template.title}</Typography>
                      <Chip size="small" color={template.isActive ? 'success' : 'default'} label={template.isActive ? 'Aktiv' : 'Pausiert'} />
                    </Stack>
                    <Typography variant="body2" color="text.secondary">{template.assignedMember.name} · {routinePeriodLabels[template.routinePeriod]} · {repeatDaysLabel(template.repeatDays)} · {template.steps.length} Schritte</Typography>
                  </div>
                  <Stack direction="row" alignItems="center">
                    <IconButton aria-label={`${template.title} bearbeiten`} onClick={() => onEdit(template)}><EditRounded /></IconButton>
                    <IconButton aria-label={template.isActive ? `${template.title} pausieren` : `${template.title} fortsetzen`} disabled={pending} onClick={() => update.mutate({ id: template.id, input: inputFrom(template, !template.isActive) })}>
                      {template.isActive ? <PauseCircleOutlineRounded /> : <PlayCircleOutlineRounded />}
                    </IconButton>
                    <Button color="error" disabled={pending} onClick={() => deleteTemplate(template)}>Löschen</Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2.5 }}><Button onClick={onClose} disabled={pending}>Schließen</Button></DialogActions>
    </Dialog>
  );
}
