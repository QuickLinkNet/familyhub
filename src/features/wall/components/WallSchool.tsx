import { SchoolRounded } from '@mui/icons-material';
import { Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { MemberAvatar } from '../../../components/atoms/MemberAvatar';
import type { SchoolItem, SchoolLesson } from '../../school/types/school';
import { shortDate } from '../../school/utils/schoolDates';

export function WallSchool({ lessons, items }: { lessons: SchoolLesson[]; items: SchoolItem[] }) {
  const weekday = new Date().getDay() || 7; const today = lessons.filter(lesson => lesson.weekday === weekday); const upcoming = items.filter(item => item.completedAt === null).slice(0, 4);
  return <Card><CardContent sx={{ p: { xs: 2.5, md: 3 }, '&:last-child': { pb: { xs: 2.5, md: 3 } } }}><Stack direction="row" alignItems="center" gap={1} mb={2.5}><SchoolRounded color="primary" /><Typography variant="h5">Schule im Blick</Typography></Stack><BoxContent title="Heute im Stundenplan" empty="Heute ist kein Unterricht eingetragen.">{today.slice(0, 5).map(lesson => <Stack key={lesson.id} direction="row" gap={1} alignItems="center" sx={{ p: 1.25, borderRadius: 3, bgcolor: `${lesson.color}18`, borderLeft: `5px solid ${lesson.color}` }}><Typography fontWeight={800} sx={{ flex: 1 }}>{lesson.subject}</Typography><Typography>{lesson.startsAt}</Typography><MemberAvatar name={lesson.member.name} sx={{ width: 28, height: 28, fontSize: 12, bgcolor: lesson.member.color }} /></Stack>)}</BoxContent><BoxContent title="Demnächst fällig" empty="Keine offenen Hausaufgaben oder Tests.">{upcoming.map(item => <Stack key={item.id} direction="row" gap={1} alignItems="center" sx={{ p: 1.25, borderRadius: 3, bgcolor: 'action.hover' }}><Chip size="small" label={item.itemType === 'TEST' ? 'Test' : 'Aufgabe'} color={item.itemType === 'TEST' ? 'secondary' : 'default'} /><Typography fontWeight={800} sx={{ flex: 1 }}>{item.subject}: {item.title}</Typography><Typography variant="body2">{shortDate(item.dueDate)}</Typography></Stack>)}</BoxContent></CardContent></Card>;
}

function BoxContent({ title, empty, children }: { title: string; empty: string; children: ReactNode }) {
  return <Stack spacing={1.1} mb={2}><Typography fontWeight={800} color="text.secondary">{title}</Typography>{children && (Array.isArray(children) ? children.length > 0 : true) ? children : <Typography color="text.secondary">{empty}</Typography>}</Stack>;
}
