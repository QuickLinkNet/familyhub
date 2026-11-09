import { EditRounded, MeetingRoomRounded, PersonRounded } from '@mui/icons-material';
import { IconButton, Stack, Typography } from '@mui/material';
import type { SchoolLesson } from '../types/school';

export function LessonCard({ lesson, canManage, onEdit }: { lesson: SchoolLesson; canManage: boolean; onEdit: () => void }) {
  return <Stack sx={{ borderLeft: `6px solid ${lesson.color}`, bgcolor: `${lesson.color}18`, borderRadius: 3, p: 1.5 }} spacing={0.4}>
    <Stack direction="row" alignItems="center" gap={1}><Typography fontWeight={800} sx={{ flex: 1 }}>{lesson.subject}</Typography>{canManage && <IconButton size="small" aria-label={`${lesson.subject} bearbeiten`} onClick={onEdit}><EditRounded fontSize="small" /></IconButton>}</Stack>
    <Typography variant="body2" fontWeight={700}>{lesson.startsAt}–{lesson.endsAt}</Typography>
    {(lesson.room || lesson.teacher) && <Stack direction="row" flexWrap="wrap" gap={1.5}>{lesson.room && <Stack direction="row" gap={0.5} alignItems="center"><MeetingRoomRounded sx={{ fontSize: 16 }} /><Typography variant="caption">{lesson.room}</Typography></Stack>}{lesson.teacher && <Stack direction="row" gap={0.5} alignItems="center"><PersonRounded sx={{ fontSize: 16 }} /><Typography variant="caption">{lesson.teacher}</Typography></Stack>}</Stack>}
  </Stack>;
}
