import { useState } from 'react';
import { AddRounded, CalendarMonthRounded, CheckCircleRounded, DeleteOutlineRounded, HouseRounded, PeopleRounded } from '@mui/icons-material';
import { Alert, Avatar, Box, Button, Card, CardContent, Container, FormControl, IconButton, InputLabel, MenuItem, Select, Stack, Step, StepLabel, Stepper, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ApiError } from '../../../services/apiClient';
import { useInstallHousehold } from '../hooks/useSetup';
import type { SetupInput, SetupMemberInput, SetupRole } from '../types/setup';

interface MemberDraft extends SetupMemberInput { clientId: string; }
const colors = ['#345B48', '#D6855F', '#6C8AB8', '#8A7060', '#6A7E3A', '#9A6C8D', '#D09A38', '#4C8C91'];
const roles: Record<SetupRole, string> = { ADMIN: 'Admin', PARENT: 'Elternteil', CHILD: 'Kind' };
const steps = ['Haushalt', 'Familie', 'Kalender & Start'];
const newMember = (index: number, role: SetupRole = 'CHILD'): MemberDraft => ({ clientId: crypto.randomUUID(), name: '', role, color: colors[index % colors.length], password: '', pin: '' });

export function SetupPage() {
  const navigate = useNavigate();
  const install = useInstallHousehold();
  const [step, setStep] = useState(0);
  const [householdName, setHouseholdName] = useState('Unsere Familie');
  const [locale, setLocale] = useState('de-DE');
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Berlin');
  const [members, setMembers] = useState<MemberDraft[]>([newMember(0, 'ADMIN')]);
  const [error, setError] = useState<string | null>(null);

  const updateMember = <K extends keyof MemberDraft>(clientId: string, key: K, value: MemberDraft[K]) => setMembers(current => current.map(member => member.clientId === clientId ? { ...member, [key]: value } : member));
  const validateCurrent = () => {
    if (step === 0 && (householdName.trim().length < 2 || timezone.trim().length < 3)) return 'Bitte Haushaltsname und Zeitzone vollständig angeben.';
    if (step === 1) {
      if (members.some(member => member.name.trim().length < 2)) return 'Bitte für jedes Familienmitglied einen Namen angeben.';
      if (!members.some(member => member.role === 'ADMIN' || member.role === 'PARENT')) return 'Mindestens ein Admin oder Elternteil ist erforderlich.';
      if (members.some(member => member.role !== 'CHILD' && (member.password?.length ?? 0) < 8)) return 'Passwörter für Erwachsene benötigen mindestens 8 Zeichen.';
      if (members.some(member => member.role === 'CHILD' && member.pin && !/^\d{4,8}$/.test(member.pin))) return 'Kinder-PINs müssen aus 4 bis 8 Ziffern bestehen.';
    }
    return null;
  };
  const next = () => { const validation = validateCurrent(); setError(validation); if (!validation) setStep(current => current + 1); };
  const finish = async () => {
    setError(null);
    const input: SetupInput = { householdName: householdName.trim(), locale, timezone: timezone.trim(), members: members.map(({ clientId: _clientId, ...member }) => member) };
    try { await install.mutateAsync(input); navigate('/', { replace: true }); }
    catch (cause) { setError(cause instanceof ApiError ? cause.message : 'Die Einrichtung konnte nicht abgeschlossen werden.'); }
  };

  return <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: { xs: 2, md: 5 } }}>
    <Container maxWidth="md">
      <Stack spacing={{ xs: 2.5, md: 4 }}>
        <Box textAlign="center"><Typography variant="h4" color="primary">Familienkompass</Typography><Typography color="text.secondary" mt={0.5}>Einmal gemeinsam einrichten – danach gehört das System euch.</Typography></Box>
        <Stepper activeStep={step} alternativeLabel>{steps.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}</Stepper>
        <Card><CardContent sx={{ p: { xs: 2.5, sm: 4 }, '&:last-child': { pb: { xs: 2.5, sm: 4 } } }}>
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          {step === 0 && <HouseholdStep householdName={householdName} setHouseholdName={setHouseholdName} locale={locale} setLocale={setLocale} timezone={timezone} setTimezone={setTimezone} />}
          {step === 1 && <FamilyStep members={members} updateMember={updateMember} addMember={() => setMembers(current => [...current, newMember(current.length)])} removeMember={clientId => setMembers(current => current.filter(member => member.clientId !== clientId))} />}
          {step === 2 && <SummaryStep householdName={householdName} timezone={timezone} members={members} />}
          <Stack direction="row" justifyContent="space-between" mt={4} gap={2}>
            <Button onClick={() => { setError(null); setStep(current => Math.max(0, current - 1)); }} disabled={step === 0 || install.isPending}>Zurück</Button>
            {step < steps.length - 1 ? <Button variant="contained" onClick={next}>Weiter</Button> : <Button variant="contained" size="large" startIcon={<CheckCircleRounded />} disabled={install.isPending} onClick={finish}>{install.isPending ? 'Wird eingerichtet …' : 'Familienkompass starten'}</Button>}
          </Stack>
        </CardContent></Card>
        <Typography variant="caption" color="text.secondary" textAlign="center">Passwörter und PINs werden ausschließlich gehasht gespeichert.</Typography>
      </Stack>
    </Container>
  </Box>;
}

function HouseholdStep({ householdName, setHouseholdName, locale, setLocale, timezone, setTimezone }: { householdName: string; setHouseholdName: (value: string) => void; locale: string; setLocale: (value: string) => void; timezone: string; setTimezone: (value: string) => void }) {
  return <Stack spacing={3}><Stack direction="row" spacing={1.5} alignItems="center"><Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main' }}><HouseRounded /></Avatar><Box><Typography variant="h5">Euer Zuhause</Typography><Typography color="text.secondary">Grunddaten für Termine, Erinnerungen und Anzeigeformate.</Typography></Box></Stack><TextField autoFocus required label="Name des Haushalts" value={householdName} onChange={event => setHouseholdName(event.target.value)} helperText="Zum Beispiel Familie Müller oder Zuhause am Park" inputProps={{ maxLength: 80 }} /><Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}><FormControl><InputLabel id="setup-locale-label">Sprache</InputLabel><Select labelId="setup-locale-label" label="Sprache" value={locale} onChange={event => setLocale(event.target.value)}><MenuItem value="de-DE">Deutsch (Deutschland)</MenuItem><MenuItem value="de-AT">Deutsch (Österreich)</MenuItem><MenuItem value="de-CH">Deutsch (Schweiz)</MenuItem><MenuItem value="en-GB">English</MenuItem></Select></FormControl><TextField required label="Zeitzone" value={timezone} onChange={event => setTimezone(event.target.value)} helperText="IANA-Zeitzone, z. B. Europe/Berlin" /></Box></Stack>;
}

function FamilyStep({ members, updateMember, addMember, removeMember }: { members: MemberDraft[]; updateMember: <K extends keyof MemberDraft>(id: string, key: K, value: MemberDraft[K]) => void; addMember: () => void; removeMember: (id: string) => void }) {
  return <Stack spacing={2.5}><Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={2}><Stack direction="row" spacing={1.5} alignItems="center"><Avatar sx={{ bgcolor: 'secondary.light', color: 'secondary.dark' }}><PeopleRounded /></Avatar><Box><Typography variant="h5">Wer gehört dazu?</Typography><Typography color="text.secondary">Bis zu 12 Personen mit eigener Rolle und Farbe.</Typography></Box></Stack><Button startIcon={<AddRounded />} onClick={addMember}>Person hinzufügen</Button></Stack>{members.map((member, index) => <Card key={member.clientId} variant="outlined"><CardContent><Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}><Stack direction="row" alignItems="center" spacing={1}><Avatar sx={{ bgcolor: member.color }}>{member.name.trim()[0]?.toUpperCase() ?? index + 1}</Avatar><Typography fontWeight={700}>Person {index + 1}</Typography></Stack><IconButton aria-label="Person entfernen" disabled={members.length === 1} onClick={() => removeMember(member.clientId)}><DeleteOutlineRounded /></IconButton></Stack><Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1.4fr 1fr' }, gap: 2 }}><TextField required label="Name" value={member.name} onChange={event => updateMember(member.clientId, 'name', event.target.value)} inputProps={{ maxLength: 80 }} /><FormControl><InputLabel id={`role-${member.clientId}`}>Rolle</InputLabel><Select labelId={`role-${member.clientId}`} label="Rolle" value={member.role} onChange={event => updateMember(member.clientId, 'role', event.target.value as SetupRole)}>{(Object.keys(roles) as SetupRole[]).map(role => <MenuItem key={role} value={role}>{roles[role]}</MenuItem>)}</Select></FormControl></Box><Box mt={2}>{member.role === 'CHILD' ? <TextField fullWidth label="Kinder-PIN (optional)" type="password" value={member.pin ?? ''} onChange={event => updateMember(member.clientId, 'pin', event.target.value)} helperText="4 bis 8 Ziffern für den einfachen Touchscreen-Zugang" inputProps={{ inputMode: 'numeric', maxLength: 8 }} /> : <TextField fullWidth required label="Passwort" type="password" autoComplete="new-password" value={member.password ?? ''} onChange={event => updateMember(member.clientId, 'password', event.target.value)} helperText="Mindestens 8 Zeichen" inputProps={{ maxLength: 128 }} />}</Box><Stack direction="row" gap={1} flexWrap="wrap" mt={2}>{colors.map(color => <Button key={color} aria-label={`Farbe ${color}`} onClick={() => updateMember(member.clientId, 'color', color)} sx={{ minWidth: 44, width: 44, height: 44, borderRadius: '50%', bgcolor: color, border: member.color === color ? '4px solid white' : '2px solid transparent', outline: member.color === color ? `3px solid ${color}` : 'none', '&:hover': { bgcolor: color } }} />)}</Stack></CardContent></Card>)}</Stack>;
}

function SummaryStep({ householdName, timezone, members }: { householdName: string; timezone: string; members: MemberDraft[] }) {
  return <Stack spacing={3}><Stack direction="row" spacing={1.5} alignItems="center"><Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main' }}><CalendarMonthRounded /></Avatar><Box><Typography variant="h5">Bereit für euren Alltag</Typography><Typography color="text.secondary">Diese Grundstruktur wird jetzt einmalig angelegt.</Typography></Box></Stack><Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}><SummaryCard value={householdName} label={timezone} /><SummaryCard value={`${members.length} Personen`} label={members.map(member => member.name).join(', ')} /><SummaryCard value={`${members.length + 1} Kalender`} label="1 Familienkalender plus persönliche Kalender" /></Box><Alert severity="info">Nach der Einrichtung kann dieser Assistent nicht erneut gestartet werden. Profile und Einstellungen lassen sich später einzeln bearbeiten.</Alert></Stack>;
}

function SummaryCard({ value, label }: { value: string; label: string }) { return <Card variant="outlined"><CardContent><Typography variant="h6">{value}</Typography><Typography variant="body2" color="text.secondary" mt={0.5}>{label}</Typography></CardContent></Card>; }
