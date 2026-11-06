import { useState, type FormEvent } from 'react';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from '@mui/material';
import type { GoogleOAuthConfigInput } from '../types/googleCalendar';
import { GoogleSetupCopyField } from './GoogleSetupCopyField';
import { GoogleSetupGuideStep } from './GoogleSetupGuideStep';

interface GoogleSetupDialogProps {
  callbackUrl: string;
  pending: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (input: GoogleOAuthConfigInput) => Promise<void>;
}

const EVENT_SCOPE = 'https://www.googleapis.com/auth/calendar.events';
const CALENDAR_LIST_SCOPE = 'https://www.googleapis.com/auth/calendar.calendarlist.readonly';

export function GoogleSetupDialog({ callbackUrl, pending, error, onClose, onSave }: GoogleSetupDialogProps) {
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSave({ clientId: clientId.trim(), clientSecret: clientSecret.trim() });
  };

  return (
    <Dialog
      open
      onClose={pending ? undefined : onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{ component: 'form', onSubmit: submit }}
    >
      <DialogTitle>Google-Kalender Schritt für Schritt verbinden</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Alert severity="info">
            Diese Einrichtung ist nur einmal pro FamilyHub-Installation nötig. Danach verbindet jedes Familienmitglied sein Google-Konto mit wenigen Klicks.
          </Alert>

          <GoogleSetupGuideStep
            number={1}
            title="Projekt wählen und Calendar API aktivieren"
            description="Wähle in Google Cloud ein bestehendes Projekt oder erstelle ein neues. Aktiviere anschließend die Google Calendar API."
            actionHref="https://console.cloud.google.com/apis/library/calendar-json.googleapis.com"
            actionLabel="Calendar API öffnen"
          />

          <GoogleSetupGuideStep
            number={2}
            title="App-Informationen eintragen"
            description={<>Trage unter <strong>Google Auth Platform → Branding</strong> zum Beispiel „FamilyHub“ als App-Namen und deine eigene E-Mail als Supportkontakt ein.</>}
            actionHref="https://console.cloud.google.com/auth/branding"
            actionLabel="Branding öffnen"
          />

          <GoogleSetupGuideStep
            number={3}
            title="Zielgruppe und Testnutzer festlegen"
            description={<>Wähle für normale private Google-Konten <strong>Extern</strong>. Im Testmodus musst du alle Google-Konten der Familie als Testnutzer hinzufügen.</>}
            actionHref="https://console.cloud.google.com/auth/audience"
            actionLabel="Zielgruppe öffnen"
          >
            <Alert severity="warning" sx={{ py: 0.5 }}>
              Im Testmodus können Google-Tokens nach sieben Tagen ablaufen. Für dauerhaften Betrieb die App später in den Produktionsstatus versetzen.
            </Alert>
          </GoogleSetupGuideStep>

          <GoogleSetupGuideStep
            number={4}
            title="Berechtigungen hinzufügen"
            description="Füge unter Data Access genau diese beiden Kalender-Berechtigungen hinzu. FamilyHub kann damit Termine bearbeiten und die Kalenderliste anzeigen."
            actionHref="https://console.cloud.google.com/auth/scopes"
            actionLabel="Data Access öffnen"
          >
            <Stack spacing={1}>
              <GoogleSetupCopyField label="Termine lesen und bearbeiten" value={EVENT_SCOPE} />
              <GoogleSetupCopyField label="Kalenderliste lesen" value={CALENDAR_LIST_SCOPE} />
            </Stack>
          </GoogleSetupGuideStep>

          <GoogleSetupGuideStep
            number={5}
            title="OAuth-Client erstellen"
            description={<>Erstelle unter <strong>Clients</strong> einen neuen Client vom Typ <strong>Webanwendung</strong>, zum Beispiel mit dem Namen „FamilyHub Web“.</>}
            actionHref="https://console.cloud.google.com/auth/clients"
            actionLabel="Clients öffnen"
          >
            <GoogleSetupCopyField label="Autorisierte Weiterleitungs-URI" value={callbackUrl} />
            <Typography variant="caption" color="text.secondary">
              Die URI muss bei Google exakt so eingetragen sein. „Autorisierte JavaScript-Quellen“ darf leer bleiben.
            </Typography>
          </GoogleSetupGuideStep>

          <GoogleSetupGuideStep
            number={6}
            title="Zugangsdaten hier eintragen"
            description="Kopiere Client-ID und Client-Secret aus Google in die beiden Felder. Nach dem Speichern erscheint die Schaltfläche „Mit Google anmelden“."
          >
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
              required
              label="OAuth-Client-ID"
              placeholder="…apps.googleusercontent.com"
              value={clientId}
              onChange={event => setClientId(event.target.value)}
              autoComplete="off"
              inputProps={{ maxLength: 255 }}
              helperText="Die Client-ID endet normalerweise auf .apps.googleusercontent.com"
            />
            <TextField
              required
              type="password"
              label="OAuth-Client-Secret"
              placeholder="GOCSPX-…"
              value={clientSecret}
              onChange={event => setClientSecret(event.target.value)}
              autoComplete="new-password"
              inputProps={{ maxLength: 255 }}
              helperText="Das Secret wird verschlüsselt auf dem FamilyHub-Server gespeichert und nie an das Browser-Frontend zurückgegeben."
            />
          </GoogleSetupGuideStep>

          <Alert severity="success">
            Danach: <strong>Sicher speichern → Mit Google anmelden → Konto wählen → Zugriff erlauben.</strong> Den bestehenden iCal-Link erst deaktivieren, wenn die direkte Verbindung erfolgreich getestet wurde – sonst fehlen vorübergehend Termine.
          </Alert>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={onClose} disabled={pending}>Abbrechen</Button>
        <Button type="submit" variant="contained" disabled={pending || !clientId.trim() || !clientSecret.trim()}>
          {pending ? 'Wird gespeichert …' : 'Sicher speichern'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
