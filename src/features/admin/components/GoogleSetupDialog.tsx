import { useState, type FormEvent } from 'react';
import { ContentCopyRounded, LaunchRounded } from '@mui/icons-material';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Link, Stack, TextField, Typography } from '@mui/material';
import type { GoogleOAuthConfigInput } from '../types/googleCalendar';

interface GoogleSetupDialogProps {
  callbackUrl: string;
  pending: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (input: GoogleOAuthConfigInput) => Promise<void>;
}

export function GoogleSetupDialog({ callbackUrl, pending, error, onClose, onSave }: GoogleSetupDialogProps) {
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [copied, setCopied] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSave({ clientId: clientId.trim(), clientSecret: clientSecret.trim() });
  };
  const copyCallback = async () => {
    await navigator.clipboard.writeText(callbackUrl);
    setCopied(true);
  };

  return (
    <Dialog open onClose={pending ? undefined : onClose} fullWidth maxWidth="md" PaperProps={{ component: 'form', onSubmit: submit }}>
      <DialogTitle>Google-Schreibzugriff einrichten</DialogTitle>
      <DialogContent>
        <Stack spacing={2.25} pt={1}>
          <Alert severity="info">Ein Google-Projekt wird nur einmal für diese FamilyHub-Installation benötigt. Familienmitglieder verbinden danach ihr Konto per Google-Anmeldung – ohne Service-Account.</Alert>
          <Stack component="ol" spacing={1.25} sx={{ pl: 2.5, m: 0 }}>
            <Typography component="li">Öffne die <Link href="https://console.cloud.google.com/apis/library/calendar-json.googleapis.com" target="_blank" rel="noreferrer">Google Cloud Console <LaunchRounded sx={{ fontSize: 15, verticalAlign: 'text-bottom' }} /></Link>, erstelle oder wähle ein Projekt und aktiviere die Google Calendar API.</Typography>
            <Typography component="li">Richte den OAuth-Zustimmungsbildschirm ein. Für die private Nutzung genügt zunächst der Testmodus mit den gewünschten Google-Konten als Testnutzer.</Typography>
            <Typography component="li">Erstelle unter „APIs & Dienste → Anmeldedaten“ eine OAuth-Client-ID vom Typ „Webanwendung“.</Typography>
            <Typography component="li">Trage exakt diese autorisierte Weiterleitungs-URI ein:</Typography>
          </Stack>
          <TextField label="Autorisierte Weiterleitungs-URI" value={callbackUrl} slotProps={{ input: { readOnly: true, endAdornment: <Button size="small" startIcon={<ContentCopyRounded />} onClick={copyCallback}>{copied ? 'Kopiert' : 'Kopieren'}</Button> } }} />
          <Typography variant="body2" color="text.secondary">Client-ID und Secret werden serverseitig verschlüsselt gespeichert und niemals an das Browser-Frontend zurückgegeben.</Typography>
          <Alert severity="warning">Googles Testmodus eignet sich zum Einrichten, kann Refresh-Tokens aber nach sieben Tagen ungültig machen. Für dauerhaften Familienbetrieb den Zustimmungsbildschirm anschließend in den Produktionsstatus versetzen.</Alert>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField required autoFocus label="OAuth-Client-ID" value={clientId} onChange={event => setClientId(event.target.value)} autoComplete="off" inputProps={{ maxLength: 255 }} />
          <TextField required type="password" label="OAuth-Client-Secret" value={clientSecret} onChange={event => setClientSecret(event.target.value)} autoComplete="new-password" inputProps={{ maxLength: 255 }} />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2.5, pt: 1.5 }}>
        <Button onClick={onClose} disabled={pending}>Abbrechen</Button>
        <Button type="submit" variant="contained" disabled={pending}>{pending ? 'Wird gespeichert …' : 'Sicher speichern'}</Button>
      </DialogActions>
    </Dialog>
  );
}
