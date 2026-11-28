import { useEffect, useState } from 'react';
import { Alert, Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, InputLabel, MenuItem, Select, Stack, Step, StepLabel, Stepper, Typography } from '@mui/material';
import type { HolidayPreview, HolidayRegion, HolidaySettingsInput, HolidayStatus } from '../types/holiday';
import { HolidayPreviewList } from './HolidayPreviewList';

interface Props {
  status: HolidayStatus;
  preview?: HolidayPreview;
  previewing: boolean;
  saving: boolean;
  removing: boolean;
  error: string | null;
  onPreview: (input: HolidaySettingsInput) => Promise<void>;
  onSave: (input: HolidaySettingsInput) => Promise<void>;
  onRemove: () => void;
  onClose: () => void;
}

const steps = ['Region', 'Inhalte', 'Vorschau'];

export function HolidayAssistantDialog(props: Props) {
  const { status, preview, previewing, saving, removing, error, onPreview, onSave, onRemove, onClose } = props;
  const [step, setStep] = useState(0);
  const [subdivisionCode, setSubdivisionCode] = useState(status.subdivisionCode ?? '');
  const [publicEnabled, setPublicEnabled] = useState(status.publicEnabled);
  const [schoolEnabled, setSchoolEnabled] = useState(status.schoolEnabled);
  const input = { subdivisionCode, publicEnabled, schoolEnabled };
  const busy = previewing || saving || removing;

  useEffect(() => { if (step === 2 && subdivisionCode) void onPreview(input); }, [step]); // Intentional: preview only when entering step 3.

  const next = () => setStep(current => Math.min(2, current + 1));
  const validContent = publicEnabled || schoolEnabled;

  return (
    <Dialog open onClose={busy ? undefined : onClose} fullWidth maxWidth="md" aria-labelledby="holiday-dialog-title">
      <DialogTitle id="holiday-dialog-title">Ferien & Feiertage einrichten</DialogTitle>
      <DialogContent>
        <Stack spacing={3} pt={1}>
          <Stepper activeStep={step} alternativeLabel>{steps.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}</Stepper>
          {error && <Alert severity="error" role="alert">{error}</Alert>}
          {step === 0 && <RegionStep regions={status.regions} value={subdivisionCode} onChange={setSubdivisionCode} />}
          {step === 1 && (
            <Stack spacing={2}>
              <Typography>Wähle mindestens eine Kalenderquelle. Beide lassen sich später unabhängig filtern.</Typography>
              <FormControlLabel control={<Checkbox checked={publicEnabled} onChange={event => setPublicEnabled(event.target.checked)} />} label="Gesetzliche Feiertage" />
              <FormControlLabel control={<Checkbox checked={schoolEnabled} onChange={event => setSchoolEnabled(event.target.checked)} />} label="Schulferien" />
              {!validContent && <Alert severity="warning">Wähle mindestens eine Kategorie.</Alert>}
            </Stack>
          )}
          {step === 2 && (
            <Stack spacing={2.5}>
              <Alert severity="info">Diese Vorschau speichert noch nichts. Vorhandene Kalenderdaten werden nicht verändert.</Alert>
              {previewing && <Typography color="text.secondary">Vorschau wird geladen …</Typography>}
              {preview && (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' }, gap: 3 }}>
                  {publicEnabled && <Box><Typography variant="h6">Gesetzliche Feiertage</Typography><HolidayPreviewList events={preview.public} emptyLabel="Keine Feiertage im Vorschauzeitraum." /></Box>}
                  {schoolEnabled && <Box><Typography variant="h6">Schulferien</Typography><HolidayPreviewList events={preview.school} emptyLabel="Keine Schulferien im Vorschauzeitraum." /></Box>}
                </Box>
              )}
            </Stack>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2.5, pt: 1.5, flexWrap: 'wrap' }}>
        {status.configured && <Button color="error" onClick={onRemove} disabled={busy}>Kalender entfernen</Button>}
        <Box sx={{ flex: 1 }} />
        <Button onClick={onClose} disabled={busy}>Abbrechen</Button>
        {step > 0 && <Button onClick={() => setStep(current => current - 1)} disabled={busy}>Zurück</Button>}
        {step < 2 && <Button variant="contained" onClick={next} disabled={busy || (step === 0 ? !subdivisionCode : !validContent)}>Weiter</Button>}
        {step === 2 && <Button variant="contained" onClick={() => void onSave(input)} disabled={busy || !preview}>{saving ? 'Wird aktiviert …' : 'Kalender aktivieren'}</Button>}
      </DialogActions>
    </Dialog>
  );
}

function RegionStep({ regions, value, onChange }: { regions: HolidayRegion[]; value: string; onChange: (value: string) => void }) {
  return (
    <Stack spacing={2}>
      <Alert severity="info">Schulferien und einige Feiertage unterscheiden sich je Bundesland.</Alert>
      <FormControl fullWidth required>
        <InputLabel id="holiday-region-label">Bundesland</InputLabel>
        <Select labelId="holiday-region-label" label="Bundesland" value={value} onChange={event => onChange(event.target.value)}>
          {regions.map(region => <MenuItem key={region.code} value={region.code}>{region.name}</MenuItem>)}
        </Select>
      </FormControl>
      <Typography variant="body2" color="text.secondary">Land: Deutschland</Typography>
    </Stack>
  );
}

