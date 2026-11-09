import { AddRounded } from '@mui/icons-material';
import { Button, Card, CardContent, Stack, Typography } from '@mui/material';
import type { SchoolLesson } from '../types/school';
import { LessonCard } from './LessonCard';

export function TimetableDayCard({ label, dateLabel, lessons, canManage, onAdd, onEdit }: { label: string; dateLabel: string; lessons: SchoolLesson[]; canManage: boolean; onAdd: () => void; onEdit: (lesson: SchoolLesson) => void }) {
  return <Card variant="outlined" sx={{ minWidth: 0, height: '100%' }}><CardContent sx={{ p: 1.75, '&:last-child': { pb: 1.75 } }}><Stack spacing={1.25}>
    <Stack direction="row" alignItems="center"><Stack sx={{ flex: 1 }}><Typography variant="h6">{label}</Typography><Typography variant="caption" color="text.secondary">{dateLabel}</Typography></Stack>{canManage && <Button size="small" aria-label={`Stunde am ${label} hinzufügen`} onClick={onAdd} sx={{ minWidth: 40 }}><AddRounded /></Button>}</Stack>
    {lessons.length === 0 ? <Typography color="text.secondary" variant="body2" sx={{ py: 2 }}>Noch kein Unterricht eingetragen.</Typography> : lessons.map(lesson => <LessonCard key={lesson.id} lesson={lesson} canManage={canManage} onEdit={() => onEdit(lesson)} />)}
  </Stack></CardContent></Card>;
}
