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
| Installation | Haushalt, 1–12 Personen, Rollen, sichere Zugangsdaten, Kalender | fertig inklusive Komplettarchiv | geschütztes Reset-Werkzeug |
| Touch-/Kiosk-UX | Wanddisplay, Tablet, Mobilnavigation, große Ziele | Wandmodus 2.0 mit Geräte-Assistent, Wake Lock, Betriebszeiten und Nachtansicht fertig | geführte Ersteinrichtung für dedizierte Displays |
| Dashboard | Heute, Aufgaben, Familie, Pinnwand, Schule und direkter Wandmodus | fertig inklusive persönlichem Familienradar | konfigurierbare Karten |
| Identität & Rechte | Admin-/Elternpasswort, Kinder-PIN, Sessions, CSRF, Rollenrechte | Profilbearbeitung inklusive Geburtstag fertig | feinere Modulrechte |
| Aufgaben | Zuweisung, Fälligkeit, Priorität, Abschluss, Eltern-Check | Wiederholung und Elternfreigabe fertig | Bearbeiten und Historie |
| Belohnungen | Sterne, persönliche Guthaben, Wunschregal, Bonus und nachvollziehbares Ledger | fertig | Familienziele sind eigenes Modul; als Nächstes optionale Kategorien |
| Familienziele | gemeinsame Vorhaben, sichtbarer Fortschritt und Wochenhighlights | Ziele, Beitragsjournal, Dashboard und Wandmodus fertig | Zielvorlagen und automatische Fortschrittsquellen |
| Kalender | Tag/Woche/Monat, Wiederholungen, Geburtstage, Ferien | Tag/Woche/Monat, lokale Wiederholungen, Geburtstage und privater Kindermodus fertig | Ferien und Import |
| Routinen | Morgen-/Abendroutine, Schritte, Wochentage, Fortschritt | mehrstufige Tagesläufe, Fortschritt und Serienverwaltung fertig | Sterne und Routinehistorie |
| Einkauf | mehrere Listen, Kategorien, Mengen, Dringlichkeit und schnelles Abhaken | fertig | Vorlagen und Spracheingabe |
| Mahlzeiten & Rezepte | Wochenplan, Lieblingsgerichte, strukturierte Zutatenübernahme | fertig für Frühstück, Mittag und Abend | Vorlagen, Portionen und Rezeptbearbeitung |
| Notizen | Familiennotizen, Pinnwand und schnelle Hinweise | fertig inklusive Wichtig-Markierung und Ablaufdatum | Kategorien und Anhänge |
| Schule | Stundenplan, Hausaufgaben, Tests, Ferien | Wochenstundenplan, Hausaufgaben und Tests fertig | Ferien und Schulkalender-Import |
| Haushalt | Putzen, Müll, Pflanzen, Wäsche und Tiere | gemeinsamer Plan mit Zuständigkeit, Fälligkeit, Wiederholung und Historie fertig | Vorlagen und fairer Zuständigkeitswechsel |
| Wetter | aktuelle Lage und Vorschau über austauschbaren Anbieter | Open-Meteo-Adapter ohne API-Schlüssel fertig | Anbieter austauschbar kapseln |
| Foto-/Idle-Modus | Diashow, Uhrzeit, Wetter und nächster Termin | Foto-Rotation, Inaktivitäts-Timer, Wake Lock und zeitgesteuerte Nachtuhr fertig | konfigurierbare Nachtinformationen |
| Benachrichtigungen | In-App, Browser und Web Push | rollenabhängiger Radar, Glocke, Wandmodus und verschlüsselter Web Push bei geschlossener App fertig | Benachrichtigungszeiten pro Profil |
| Integrationen | Google, Microsoft, CalDAV, Home Assistant | Google iCal read-only und OAuth-Schreibzugriff fertig | CalDAV oder Microsoft Graph |
| Datenhoheit | lokaler Export, Import, Backups und Self-Hosting | portables Komplettarchiv mit Datenbank, Fotos, Schlüsseln, Prüfsummen und Rollback fertig | optional verschlüsselte Archivdateien |
| Barrierefreiheit | Tastatur, Kontrast, Screenreader, reduzierte Bewegung | in Arbeit | automatisierte und manuelle Prüfung |

## Empfohlene Produktreihenfolge

1. **Weitere Integrationen** – CalDAV, Microsoft Graph und Home Assistant.
2. **Barrierefreiheits-Abnahme** – Tastatur, Screenreader, Kontrast und reduzierte Bewegung systematisch prüfen.
3. **Kalenderkomfort** – Ferienimport, Mehrpersonen-Termine und frei wählbare Standardansicht.

## Qualitätsmaßstab

Ein Slice gilt erst als fertig, wenn Frontend, Live-API, Validierung, Fehlerzustände, responsive Touch-Bedienung, Migration und Dokumentation zusammen funktionieren. Platzhalterkarten allein zählen als vorbereitet, nicht als fertiges Feature.
