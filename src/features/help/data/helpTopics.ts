import {
  BackupRounded,
  BeachAccessRounded,
  CalendarMonthRounded,
  CloudSyncRounded,
  DashboardRounded,
  DevicesRounded,
  NotificationsActiveRounded,
  SystemUpdateAltRounded
} from '@mui/icons-material';
import type { HelpTopic } from '../types/help';

export const helpTopics: HelpTopic[] = [
  {
    id: 'basics',
    title: 'Schnell zurechtfinden',
    summary: 'Die wichtigsten Bereiche und Bedienelemente auf einen Blick.',
    icon: DashboardRounded,
    steps: [
      'Öffne am Handy das Menü oben links oder nutze die Leiste am unteren Rand.',
      'Auf großen Bildschirmen findest du alle Bereiche dauerhaft links.',
      'Profil, persönliche Ansicht und Abmeldung liegen oben rechts im Profilmenü.'
    ]
  },
  {
    id: 'calendar',
    title: 'Kalender gemeinsam nutzen',
    summary: 'Termine, Ansichten und Familienprofile sinnvoll kombinieren.',
    icon: CalendarMonthRounded,
    steps: [
      'Wähle Tag, Timeline, fünf Tage, Woche oder Monat passend zur Situation.',
      'Mit Personen- und Kalenderfiltern blendest du nur relevante Termine ein.',
      'Private Termine zeigen Kindern ausschließlich die belegte Zeit.'
    ]
  },
  {
    id: 'mobile',
    title: 'FamilyHub am Handy',
    summary: 'App installieren, Gerät verbinden und unterwegs erreichbar bleiben.',
    icon: DevicesRounded,
    steps: [
      'Öffne im Profilmenü „Familienboard einrichten“ und wähle „Handy verbinden“.',
      'Scanne den QR-Code mit dem Handy und bestätige dort dein Profil.',
      'Installiere FamilyHub anschließend über das Browsermenü auf dem Startbildschirm.'
    ]
  },
  {
    id: 'google-calendar',
    title: 'Google Kalender verbinden',
    summary: 'Zwei-Wege-Synchronisation einmalig und sicher einrichten.',
    icon: CloudSyncRounded,
    adminOnly: true,
    steps: [
      'Aktiviere in einem eigenen Google-Cloud-Projekt die Google Calendar API.',
      'Trage die in FamilyHub angezeigte Weiterleitungs-URI exakt beim OAuth-Client ein.',
      'Melde dich über FamilyHub bei Google an und aktiviere die gewünschten Kalender.'
    ]
  },
  {
    id: 'holidays',
    title: 'Ferien und Feiertage',
    summary: 'Regionale Termine ohne eigenen Kalenderlink ergänzen.',
    icon: BeachAccessRounded,
    adminOnly: true,
    steps: [
      'Wähle das Bundesland und entscheide getrennt über Feiertage und Schulferien.',
      'Prüfe die Vorschau, bevor du die automatisch verwalteten Kalender speicherst.',
      'Bei einem Anbieterfehler zeigt FamilyHub weiterhin den letzten erfolgreichen Stand.'
    ]
  },
  {
    id: 'push',
    title: 'Push-Erinnerungen',
    summary: 'Hinweise auch bei geschlossener App zuverlässig zustellen.',
    icon: NotificationsActiveRounded,
    adminOnly: true,
    steps: [
      'Verbinde zuerst das Handy und erlaube Benachrichtigungen für FamilyHub.',
      'Hinterlege die geheime Scheduler-URL beim Hosting in einem Fünf-Minuten-Intervall.',
      'Nutze „Jetzt prüfen“, um die Zustellung ohne neue Familiendaten zu testen.'
    ]
  },
  {
    id: 'backups',
    title: 'Datensicherung',
    summary: 'Datenbankstände anlegen, herunterladen und kontrolliert wiederherstellen.',
    icon: BackupRounded,
    adminOnly: true,
    steps: [
      'Erstelle vor größeren Änderungen eine neue technische Sicherung.',
      'Lade regelmäßig eine Kopie herunter und bewahre sie außerhalb des Servers auf.',
      'Eine Wiederherstellung zeigt vor dem Start immer eine deutliche Sicherheitsabfrage.'
    ]
  },
  {
    id: 'archive',
    title: 'Portables Familienarchiv',
    summary: 'Die vollständige Installation sicher umziehen oder extern aufbewahren.',
    icon: SystemUpdateAltRounded,
    adminOnly: true,
    steps: [
      'Das Archiv enthält Datenbank, Fotos und die notwendigen Verbindungsschlüssel.',
      'Behandle die Datei wie ein Passwort und speichere sie verschlüsselt oder offline.',
      'Nutze das Komplettarchiv für einen Serverumzug, nicht nur die SQLite-Sicherung.'
    ]
  }
];
