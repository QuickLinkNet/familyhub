# Produkt- und Feature-Roadmap

Status: **fertig** = benutzbarer End-to-End-Slice, **in Arbeit** = aktiv vorbereitet, **vorbereitet** = Navigation oder Architektur vorhanden, **geplant** = noch nicht begonnen.

## Vergleich zum Daely-Produktbild

Der Vergleich basiert auf den sichtbaren Produktmerkmalen des als Referenz genannten digitalen Familienkalenders. Familienkompass soll nicht nur kopieren, sondern mit Selbsthosting, Datenschutz und frei kombinierbaren Familienmodulen darüber hinausgehen.

| Referenzfunktion | Familienkompass-Ziel | Status |
| --- | --- | --- |
| zentraler Familienkalender | gemeinsamer Kalender plus persönlicher Kalender je Person | Tag, Woche und Monat sowie Termin-CRUD fertig |
| farbige Personen und Termine | feste Personenfarben in Kalender, Aufgaben und Dashboard | fertig |
| Kinder haken Aufgaben selbst ab | Touch-große Aufgaben, Kinder-PIN und optionaler Eltern-Check | fertig inklusive wiederkehrender Routinen |
| Google-, Apple- oder Outlook-Anbindung | Adapter für Google Calendar, Microsoft Graph und CalDAV | Google iCal read-only und Google OAuth-Schreibzugriff fertig; CalDAV geplant |
| Wanddisplay plus mobile Nutzung | responsive installierbare PWA für Display, Tablet und Smartphone | fertig |
| schnelle Ersteinrichtung | Assistent für Haushalt, Rollen, Passwörter und Kalender | fertig |
| laufende Produktupdates | Migrationen, Backups und reproduzierbares Deployment | fertig |

## Familienkompass-Umfang

| Bereich | Geplanter Funktionsumfang | Status | Nächster Slice |
| --- | --- | --- | --- |
| Plattform | React-PWA mit Atomic Design, PHP-API, SQLite, Migrationen, Backups, Logs, Health | fertig | automatisierte Smoke-Tests |
| Installation | Haushalt, 1–12 Personen, Rollen, sichere Zugangsdaten, Kalender | fertig | Export/Import und Reset-Werkzeug |
| Touch-/Kiosk-UX | Wanddisplay, Tablet, Mobilnavigation, große Ziele | Wandmodus 2.0 mit Foto-Rotation, Wetter und Vollbild fertig | automatischer Leerlauf-Wechsel |
| Dashboard | Heute, Aufgaben, Familie, Pinnwand, Schule und direkter Wandmodus | fertig inklusive Präsentationseinstieg | konfigurierbare Karten |
| Identität & Rechte | Admin-/Elternpasswort, Kinder-PIN, Sessions, CSRF, Rollenrechte | Profilbearbeitung inklusive Geburtstag fertig | feinere Modulrechte |
| Aufgaben | Zuweisung, Fälligkeit, Priorität, Abschluss, Eltern-Check | Wiederholung und Elternfreigabe fertig | Bearbeiten und Historie |
| Belohnungen | Sterne, persönliche Guthaben, Wunschregal, Bonus und nachvollziehbares Ledger | fertig | Familienziele sind eigenes Modul; als Nächstes optionale Kategorien |
| Familienziele | gemeinsame Vorhaben, sichtbarer Fortschritt und Wochenhighlights | Ziele, Beitragsjournal, Dashboard und Wandmodus fertig | Zielvorlagen und automatische Fortschrittsquellen |
| Kalender | Tag/Woche/Monat, Wiederholungen, Geburtstage, Ferien | Tag/Woche/Monat, lokale Wiederholungen und Geburtstage fertig | Ferien und Import |
| Routinen | Morgen-/Abendroutine, Schritte, Wochentage, Fortschritt | mehrstufige Tagesläufe, Fortschritt und Serienverwaltung fertig | Sterne und Routinehistorie |
| Einkauf | mehrere Listen, Kategorien, Mengen, Dringlichkeit und schnelles Abhaken | fertig | Vorlagen und Spracheingabe |
| Mahlzeiten & Rezepte | Wochenplan, Lieblingsgerichte, strukturierte Zutatenübernahme | fertig für Frühstück, Mittag und Abend | Vorlagen, Portionen und Rezeptbearbeitung |
| Notizen | Familiennotizen, Pinnwand und schnelle Hinweise | fertig inklusive Wichtig-Markierung und Ablaufdatum | Kategorien und Anhänge |
| Schule | Stundenplan, Hausaufgaben, Tests, Ferien | Wochenstundenplan, Hausaufgaben und Tests fertig | Ferien und Schulkalender-Import |
| Haushalt | Putzen, Müll, Pflanzen, Wäsche und Tiere | gemeinsamer Plan mit Zuständigkeit, Fälligkeit, Wiederholung und Historie fertig | Vorlagen und fairer Zuständigkeitswechsel |
| Wetter | aktuelle Lage und Vorschau über austauschbaren Anbieter | Open-Meteo-Adapter ohne API-Schlüssel fertig | Anbieter austauschbar kapseln |
| Foto-/Idle-Modus | Diashow, Uhrzeit, Wetter und nächster Termin | selbst gehostete Foto-Rotation im Wandmodus fertig | Inaktivitäts-Timer |
| Benachrichtigungen | In-App, Browser und später Web Push | geplant | In-App-Erinnerungen |
| Integrationen | Google, Microsoft, CalDAV, Home Assistant | Google iCal read-only und OAuth-Schreibzugriff fertig | CalDAV oder Microsoft Graph |
| Datenhoheit | lokaler Export, Import, Backups und Self-Hosting | teilweise fertig | nutzerfreundlicher Export/Restore |
| Barrierefreiheit | Tastatur, Kontrast, Screenreader, reduzierte Bewegung | in Arbeit | automatisierte und manuelle Prüfung |

## Empfohlene Produktreihenfolge

1. **In-App-Erinnerungen** – Wichtiges rechtzeitig und rollenbezogen sichtbar machen.
2. **Weitere Integrationen** – CalDAV, Microsoft Graph und Home Assistant.
3. **Datenexport** – nutzerfreundliche Sicherung und Wiederherstellung für Self-Hoster.

## Qualitätsmaßstab

Ein Slice gilt erst als fertig, wenn Frontend, Live-API, Validierung, Fehlerzustände, responsive Touch-Bedienung, Migration und Dokumentation zusammen funktionieren. Platzhalterkarten allein zählen als vorbereitet, nicht als fertiges Feature.
