import { AddRounded, MenuBookRounded, ScienceRounded } from '@mui/icons-material';
import { Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { PageHeader } from '../../../components/molecules/PageHeader';
import { useAuthSession } from '../../auth/hooks/useAuth';
import { useFamilyMembers } from '../../family/hooks/useFamilyMembers';
import { schoolWeekdays } from '../constants/schoolOptions';
import { SchoolItemCard } from '../components/SchoolItemCard';
import { SchoolItemDialog } from '../components/SchoolItemDialog';
import { SchoolLessonDialog } from '../components/SchoolLessonDialog';
import { SchoolToolbar } from '../components/SchoolToolbar';
import { TimetableDayCard } from '../components/TimetableDayCard';
import { useDeleteSchoolItem, useDeleteSchoolLesson, useSchoolBoard, useToggleSchoolItem } from '../hooks/useSchool';
import type { SchoolItem, SchoolItemType, SchoolLesson } from '../types/school';
import { addDays, localDate, weekStart } from '../utils/schoolDates';

const weekLabel = (start: Date) => `${new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'short' }).format(start)} – ${new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'short', year: 'numeric' }).format(addDays(start, 4))}`;

export function SchoolPage() {
  const session = useAuthSession(); const family = useFamilyMembers(); const [start, setStart] = useState(() => weekStart(new Date()));
  const board = useSchoolBoard(localDate(addDays(start, -14)), localDate(addDays(start, 48))); const toggle = useToggleSchoolItem(); const deleteLesson = useDeleteSchoolLesson(); const deleteItem = useDeleteSchoolItem();
  const students = useMemo(() => { const active = (family.data ?? []).filter(member => member.isActive); const children = active.filter(member => member.role === 'CHILD'); return children.length > 0 ? children : active; }, [family.data]);
  const user = session.data?.user; const isAdult = user?.role === 'ADMIN' || user?.role === 'PARENT'; const [memberId, setMemberId] = useState('');
  useEffect(() => { if (students.length === 0) return; if (user?.role === 'CHILD' && students.some(member => member.id === user.id)) setMemberId(user.id); else setMemberId(current => students.some(member => member.id === current) ? current : students[0].id); }, [students, user]);
  const [lessonOpen, setLessonOpen] = useState(false); const [lessonWeekday, setLessonWeekday] = useState(1); const [editingLesson, setEditingLesson] = useState<SchoolLesson | null>(null); const [itemOpen, setItemOpen] = useState(false); const [itemType, setItemType] = useState<SchoolItemType>('HOMEWORK'); const [editingItem, setEditingItem] = useState<SchoolItem | null>(null); const [deleting, setDeleting] = useState<{ kind: 'lesson'; value: SchoolLesson } | { kind: 'item'; value: SchoolItem } | null>(null);
  const openLesson = (weekday: number, lesson: SchoolLesson | null = null) => { setLessonWeekday(weekday); setEditingLesson(lesson); setLessonOpen(true); };
  const openItem = (type: SchoolItemType, item: SchoolItem | null = null) => { setItemType(type); setEditingItem(item); setItemOpen(true); };
  if (family.isLoading || board.isLoading) return <Stack alignItems="center" py={8} gap={2}><CircularProgress /><Typography>Schultasche wird gepackt …</Typography></Stack>;
  if (family.isError || board.isError || !board.data) return <Alert severity="error">Die Schulübersicht konnte nicht geladen werden.</Alert>;
  if (students.length === 0) return <Stack spacing={3}><PageHeader title="Schule" description="Stundenplan, Hausaufgaben und Tests an einem Ort." /><Alert severity="info">Legt zuerst ein aktives Familienmitglied an, um einen Stundenplan zu erstellen.</Alert></Stack>;
  const lessons = board.data.lessons.filter(lesson => lesson.member.id === memberId); const items = board.data.items.filter(item => item.member.id === memberId); const openItems = items.filter(item => item.completedAt === null); const completedItems = items.filter(item => item.completedAt !== null);
  return <Stack spacing={{ xs: 2.5, md: 3.5 }}>
    <PageHeader title="Schule im Blick" description="Stundenplan, Hausaufgaben und Tests – ohne Zettelchaos im Ranzen." actions={<Stack direction="row" gap={1} flexWrap="wrap"><Button variant="outlined" startIcon={<ScienceRounded />} onClick={() => openItem('TEST')}>Test</Button><Button variant="contained" startIcon={<AddRounded />} onClick={() => openItem('HOMEWORK')}>Hausaufgabe</Button></Stack>} />
    <SchoolToolbar members={students} memberId={memberId} label={weekLabel(start)} onMember={setMemberId} onPrevious={() => setStart(addDays(start, -7))} onNext={() => setStart(addDays(start, 7))} onToday={() => setStart(weekStart(new Date()))} />
    <Box><Stack direction="row" alignItems="center" gap={1} mb={1.5}><MenuBookRounded color="secondary" /><Typography variant="h5">Wochenstundenplan</Typography></Stack><Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(5, minmax(0, 1fr))' }, gap: 1.5 }}>{schoolWeekdays.map((day, index) => <TimetableDayCard key={day.value} label={day.label} dateLabel={new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'short' }).format(addDays(start, index))} lessons={lessons.filter(lesson => lesson.weekday === day.value)} canManage={isAdult} onAdd={() => openLesson(day.value)} onEdit={lesson => openLesson(day.value, lesson)} />)}</Box></Box>
    <Box><Stack direction="row" alignItems="center" justifyContent="space-between" gap={2} mb={1.5}><Stack direction="row" alignItems="center" gap={1}><ScienceRounded color="primary" /><Typography variant="h5">Hausaufgaben & Tests</Typography></Stack><Typography color="text.secondary">{openItems.length} offen</Typography></Stack>{openItems.length === 0 ? <Alert severity="success">Alles erledigt – der Kopf ist frei!</Alert> : <Stack spacing={1.5}>{openItems.map(item => <SchoolItemCard key={item.id} item={item} canManage={isAdult || item.member.id === user?.id} onToggle={() => toggle.mutate(item.id)} onEdit={() => openItem(item.itemType, item)} />)}</Stack>}{completedItems.length > 0 && <Stack mt={2} spacing={1}><Typography fontWeight={800} color="text.secondary">Erledigt</Typography>{completedItems.slice(0, 3).map(item => <SchoolItemCard key={item.id} item={item} canManage={isAdult || item.member.id === user?.id} onToggle={() => toggle.mutate(item.id)} onEdit={() => openItem(item.itemType, item)} />)}</Stack>}</Box>
    <SchoolLessonDialog open={lessonOpen} lesson={editingLesson} members={students} memberId={memberId} defaultWeekday={lessonWeekday} onClose={() => { setLessonOpen(false); setEditingLesson(null); }} onDelete={lesson => { setLessonOpen(false); setDeleting({ kind: 'lesson', value: lesson }); }} />
    <SchoolItemDialog open={itemOpen} item={editingItem} type={itemType} members={students} memberId={user?.role === 'CHILD' ? user.id : memberId} ownMemberOnly={user?.role === 'CHILD'} onClose={() => { setItemOpen(false); setEditingItem(null); }} onDelete={item => { setItemOpen(false); setDeleting({ kind: 'item', value: item }); }} />
    <Dialog open={deleting !== null} onClose={() => setDeleting(null)}><DialogTitle>Eintrag löschen?</DialogTitle><DialogContent><Typography>{deleting?.kind === 'lesson' ? `Die Schulstunde „${deleting.value.subject}“ wird aus dem Wochenplan entfernt.` : `„${deleting?.value.title}“ wird aus der Schulübersicht entfernt.`}</Typography></DialogContent><DialogActions><Button onClick={() => setDeleting(null)}>Abbrechen</Button><Button color="error" onClick={() => { if (!deleting) return; const mutation = deleting.kind === 'lesson' ? deleteLesson : deleteItem; mutation.mutate(deleting.value.id, { onSuccess: () => setDeleting(null) }); }}>Löschen</Button></DialogActions></Dialog>
  </Stack>;
}
