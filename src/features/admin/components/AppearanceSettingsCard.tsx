import {
  DarkModeRounded,
  LightModeRounded,
  NightsStayRounded,
  PaletteRounded,
  SettingsBrightnessRounded
} from '@mui/icons-material';
import { Box, Card, CardActionArea, CardContent, Chip, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { useAppearance, type AppearancePreference } from '../../../app/providers/AppearanceProvider';
import { themePresets, type ThemePresetId } from '../../../theme';

const presetOptions = Object.entries(themePresets) as Array<[
  ThemePresetId,
  (typeof themePresets)[ThemePresetId]
]>;

const modeOptions: Array<{
  id: AppearancePreference;
  label: string;
  icon: typeof SettingsBrightnessRounded;
}> = [
  { id: 'system', label: 'System', icon: SettingsBrightnessRounded },
  { id: 'light', label: 'Hell', icon: LightModeRounded },
  { id: 'dark', label: 'Dunkel', icon: DarkModeRounded },
  { id: 'night', label: 'Nacht', icon: NightsStayRounded }
];

export function AppearanceSettingsCard() {
  const { preference, presetId, setPreference, setPresetId } = useAppearance();

  return (
    <Card>
      <CardContent sx={{ p: { xs: 2.5, md: 3 }, '&:last-child': { pb: { xs: 2.5, md: 3 } } }}>
        <Stack spacing={2.5}>
          <Stack direction="row" gap={1.5} alignItems="flex-start">
            <PaletteRounded color="primary" fontSize="large" />
            <div>
              <Typography variant="h6">Erscheinungsbild</Typography>
              <Typography color="text.secondary">
                Wähle Design und Helligkeit für dieses Gerät. Änderungen werden sofort übernommen.
              </Typography>
            </div>
          </Stack>

          <Box>
            <Typography variant="subtitle2" component="h3" mb={1}>Design</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 1.5 }}>
              {presetOptions.map(([id, preset]) => {
                const selected = presetId === id;
                const colors = preset.schemes.light;
                return (
                  <Card key={id} variant="outlined" sx={{ borderColor: selected ? 'primary.main' : 'divider', borderWidth: selected ? 2 : 1 }}>
                    <CardActionArea aria-pressed={selected} onClick={() => setPresetId(id)} sx={{ height: '100%', p: 2 }}>
                      <Stack spacing={1.5}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
                          <Typography fontWeight={800}>{preset.label}</Typography>
                          {selected && <Chip label="Aktiv" color="primary" size="small" />}
                        </Stack>
                        <Stack direction="row" gap={1} aria-hidden="true">
                          {[colors.background.canvas, colors.background.surface, colors.action.primary, colors.accent.clay].map(color => (
                            <Box key={color} sx={{ width: 34, height: 34, borderRadius: preset.radius.pill, bgcolor: color, border: '1px solid', borderColor: 'divider' }} />
                          ))}
                        </Stack>
                      </Stack>
                    </CardActionArea>
                  </Card>
                );
              })}
            </Box>
          </Box>

          <Box>
            <Typography variant="subtitle2" component="h3" mb={1}>Helligkeit</Typography>
            <ToggleButtonGroup
              exclusive
              fullWidth
              value={preference}
              onChange={(_, value: AppearancePreference | null) => value && setPreference(value)}
              aria-label="Helligkeit auswählen"
              sx={{ flexWrap: 'wrap' }}
            >
              {modeOptions.map(option => {
                const Icon = option.icon;
                return <ToggleButton key={option.id} value={option.id} aria-label={option.label}><Icon sx={{ mr: 1 }} />{option.label}</ToggleButton>;
              })}
            </ToggleButtonGroup>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
