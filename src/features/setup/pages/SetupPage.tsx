import { useState } from 'react';
import { CheckCircleRounded } from '@mui/icons-material';
import { Alert, Box, Button, Card, CardContent, Container, Stack, Step, StepLabel, Stepper, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ApiError } from '../../../services/apiClient';
import { FamilyStep } from '../components/FamilyStep';
import { HouseholdStep } from '../components/HouseholdStep';
import { SummaryStep } from '../components/SummaryStep';
import { useInstallHousehold } from '../hooks/useSetup';
import type { SetupInput } from '../types/setup';
import { createMemberDraft, type SetupMemberDraft } from '../types/setupDraft';

const steps = ['Haushalt', 'Familie', 'Kalender & Start'];

export function SetupPage() {
  const navigate = useNavigate();
  const install = useInstallHousehold();
  const [step, setStep] = useState(0);
  const [householdName, setHouseholdName] = useState('Unsere Familie');
  const [locale, setLocale] = useState('de-DE');
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Berlin');
  const [members, setMembers] = useState<SetupMemberDraft[]>([createMemberDraft(0, 'ADMIN')]);
  const [error, setError] = useState<string | null>(null);

  const updateMember = <K extends keyof SetupMemberDraft>(clientId: string, key: K, value: SetupMemberDraft[K]) => setMembers(current => current.map(member => member.clientId === clientId ? { ...member, [key]: value } : member));
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
  const next = () => {
    const validation = validateCurrent();
    setError(validation);
    if (!validation) setStep(current => current + 1);
  };
  const finish = async () => {
    setError(null);
    const input: SetupInput = { householdName: householdName.trim(), locale, timezone: timezone.trim(), members: members.map(({ clientId: _clientId, ...member }) => member) };
    try {
      await install.mutateAsync(input);
      navigate('/', { replace: true });
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Die Einrichtung konnte nicht abgeschlossen werden.');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: { xs: 2, md: 5 } }}>
      <Container maxWidth="md">
        <Stack spacing={{ xs: 2.5, md: 4 }}>
          <Box textAlign="center"><Typography variant="h4" color="primary">Familienkompass</Typography><Typography color="text.secondary" mt={0.5}>Einmal gemeinsam einrichten – danach gehört das System euch.</Typography></Box>
          <Stepper activeStep={step} alternativeLabel>{steps.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}</Stepper>
          <Card>
            <CardContent sx={{ p: { xs: 2.5, sm: 4 }, '&:last-child': { pb: { xs: 2.5, sm: 4 } } }}>
              {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
              {step === 0 && <HouseholdStep householdName={householdName} locale={locale} timezone={timezone} onHouseholdNameChange={setHouseholdName} onLocaleChange={setLocale} onTimezoneChange={setTimezone} />}
              {step === 1 && <FamilyStep members={members} onUpdate={updateMember} onAdd={() => setMembers(current => [...current, createMemberDraft(current.length)])} onRemove={clientId => setMembers(current => current.filter(member => member.clientId !== clientId))} />}
              {step === 2 && <SummaryStep householdName={householdName} timezone={timezone} members={members} />}
              <Stack direction="row" justifyContent="space-between" mt={4} gap={2}>
                <Button onClick={() => { setError(null); setStep(current => Math.max(0, current - 1)); }} disabled={step === 0 || install.isPending}>Zurück</Button>
                {step < steps.length - 1
                  ? <Button variant="contained" onClick={next}>Weiter</Button>
                  : <Button variant="contained" size="large" startIcon={<CheckCircleRounded />} disabled={install.isPending} onClick={finish}>{install.isPending ? 'Wird eingerichtet …' : 'Familienkompass starten'}</Button>}
              </Stack>
            </CardContent>
          </Card>
          <Typography variant="caption" color="text.secondary" textAlign="center">Passwörter und PINs werden ausschließlich gehasht gespeichert.</Typography>
        </Stack>
      </Container>
    </Box>
  );
}
