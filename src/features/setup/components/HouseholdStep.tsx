import { HouseRounded } from '@mui/icons-material';
import { Avatar, Box, FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';

interface HouseholdStepProps {
  householdName: string;
  locale: string;
  timezone: string;
  onHouseholdNameChange: (value: string) => void;
  onLocaleChange: (value: string) => void;
  onTimezoneChange: (value: string) => void;
}

export function HouseholdStep(props: HouseholdStepProps) {
  const { householdName, locale, timezone, onHouseholdNameChange, onLocaleChange, onTimezoneChange } = props;
  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main' }}><HouseRounded /></Avatar>
        <Box><Typography variant="h5">Euer Zuhause</Typography><Typography color="text.secondary">Grunddaten für Termine, Erinnerungen und Anzeigeformate.</Typography></Box>
      </Stack>
      <TextField autoFocus required label="Name des Haushalts" value={householdName} onChange={event => onHouseholdNameChange(event.target.value)} helperText="Zum Beispiel Familie Müller oder Zuhause am Park" inputProps={{ maxLength: 80 }} />
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
        <FormControl>
          <InputLabel id="setup-locale-label">Sprache</InputLabel>
          <Select labelId="setup-locale-label" label="Sprache" value={locale} onChange={event => onLocaleChange(event.target.value)}>
            <MenuItem value="de-DE">Deutsch (Deutschland)</MenuItem>
            <MenuItem value="de-AT">Deutsch (Österreich)</MenuItem>
            <MenuItem value="de-CH">Deutsch (Schweiz)</MenuItem>
            <MenuItem value="en-GB">English</MenuItem>
          </Select>
        </FormControl>
        <TextField required label="Zeitzone" value={timezone} onChange={event => onTimezoneChange(event.target.value)} helperText="IANA-Zeitzone, z. B. Europe/Berlin" />
      </Box>
    </Stack>
  );
}
