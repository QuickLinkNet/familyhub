# Produkt- und Feature-Roadmap

Langfristiges Referenzziel: [vollständige Dæly-Parität](DAELY_PARITY.md).

Status: **fertig** = benutzbarer End-to-End-Slice, **in Arbeit** = aktiv vorbereitet, **vorbereitet** = Navigation oder Architektur vorhanden, **geplant** = noch nicht begonnen.

## Vergleich zum Daely-Produktbild

Der Vergleich basiert auf den sichtbaren Produktmerkmalen des als Referenz genannten digitalen Familienkalenders. FamilyHub soll nicht nur kopieren, sondern mit Selbsthosting, Datenschutz und frei kombinierbaren Familienmodulen darüber hinausgehen.

| Referenzfunktion | FamilyHub-Ziel | Status |
| --- | --- | --- |
| zentraler Familienkalender | gemeinsamer Kalender plus persönlicher Kalender je Person | Tag, Woche und Monat sowie Termin-CRUD fertig |
| farbige Personen und Termine | Mehrpersonen-Termine mit kombinierten Profilfarben in Tag, Woche und Monat | fertig |
| Kinder haken Aufgaben selbst ab | Touch-große Aufgaben, Kinder-PIN und optionaler Eltern-Check | fertig inklusive wiederkehrender Routinen |
| Google-, Apple- oder Outlook-Anbindung | Adapter für Google Calendar, Microsoft Graph und CalDAV | Google iCal read-only und Google OAuth-Schreibzugriff fertig; CalDAV geplant |
| Wanddisplay plus mobile Nutzung | responsive installierbare PWA für Display, Tablet und Smartphone | fertig |
| schnelle Ersteinrichtung | Assistent für Haushalt, Rollen, Passwörter und Kalender | fertig |
| laufende Produktupdates | Migrationen, Backups und reproduzierbares Deployment | fertig |

## FamilyHub-Umfang

| Bereich | Geplanter Funktionsumfang | Status | Nächster Slice |
| --- | --- | --- | --- |
| Plattform | React-PWA mit Atomic Design, PHP-API, SQLite, Migrationen, Backups, Logs, Health | fertig | automatisierte Smoke-Tests |
| Installation | Haushalt, 1–12 Personen, Rollen, sichere Zugangsdaten, Kalender | fertig inklusive Komplettarchiv | geschütztes Reset-Werkzeug |
| Touch-/Kiosk-UX | Wanddisplay, Tablet, Mobilnavigation, große Ziele | Wandmodus 2.0 sowie QR-gestützte Handy-, PWA- und Push-Einrichtung fertig | weiterführende kontextbezogene Hilfe |
| Dashboard | Heute, Aufgaben, Familie, Pinnwand, Schule und direkter Wandmodus | fertig inklusive persönlichem Familienradar sowie profilbezogener Auswahl und Reihenfolge | weitere Widget-Größen |
| Identität & Rechte | Admin-/Elternpasswort, Kinder-PIN, Sessions, CSRF, Rollenrechte | Profilbearbeitung inklusive Geburtstag fertig | feinere Modulrechte |
| Aufgaben | Zuweisung, Fälligkeit, Priorität, Abschluss, Eltern-Check | Wiederholung und Elternfreigabe fertig | Bearbeiten und Historie |
| Belohnungen | Sterne, persönliche Guthaben, Wunschregal, Bonus und nachvollziehbares Ledger | fertig | Familienziele sind eigenes Modul; als Nächstes optionale Kategorien |
| Familienziele | gemeinsame Vorhaben, sichtbarer Fortschritt und Wochenhighlights | Ziele, Beitragsjournal, Dashboard und Wandmodus fertig | Zielvorlagen und automatische Fortschrittsquellen |
| Kalender | Tag/Timeline/5 Tage/Woche/Monat, Mehrpersonen-Termine, Filter, Wiederholungen, Geburtstage, Ferien | fünf responsive Ansichten, Mehrpersonen-Termine, kombinierbare Profil-/Kalenderfilter, schnelle Suche, profilbezogene Standards, Wochentagsserien, mehrere Erinnerungszeiten sowie Ferien- und Feiertagsassistent fertig | weitere Komfortintegrationen |
| Routinen | Morgen-/Abendroutine, Schritte, Wochentage, Fortschritt | mehrstufige Tagesläufe, Fortschritt und Serienverwaltung fertig | Sterne und Routinehistorie |
| Einkauf | mehrere Listen, Kategorien, Mengen, Dringlichkeit und schnelles Abhaken | fertig | Vorlagen und Spracheingabe |
| Flexible Listen | Reise, Projekte, Haushalt, Ideen und private Überraschungen | fertig inklusive Sichtbarkeit, Zuständigkeit und Fortschritt | Vorlagen und Sortierung |
| Mahlzeiten & Rezepte | Wochenplan, Lieblingsgerichte, strukturierte Zutatenübernahme | fertig inklusive Portionen, Kategorien, Bearbeitung, Zubereitung und skalierter Einkaufsübernahme | Rezeptvorlagen und Suche |
| Notizen | Familiennotizen, Pinnwand und schnelle Hinweise | fertig inklusive Wichtig-Markierung und Ablaufdatum | Kategorien und Anhänge |
| Schule | Stundenplan, Hausaufgaben, Tests, Ferien | Wochenstundenplan, Hausaufgaben und Tests fertig | Ferien und Schulkalender-Import |
| Haushalt | Putzen, Müll, Pflanzen, Wäsche und Tiere | gemeinsamer Plan mit Zuständigkeit, Fälligkeit, Wiederholung und Historie fertig | Vorlagen und fairer Zuständigkeitswechsel |
| Wetter | aktuelle Lage und Vorschau über austauschbaren Anbieter | Open-Meteo-Adapter ohne API-Schlüssel fertig | Anbieter austauschbar kapseln |
| Foto-/Idle-Modus | Diashow, Uhrzeit, Wetter und nächster Termin | Foto-Rotation, Inaktivitäts-Timer, Wake Lock und zeitgesteuerte Nachtuhr fertig | konfigurierbare Nachtinformationen |
| Benachrichtigungen | In-App, Browser und Web Push | rollenabhängiger Radar, mehrere Vorlaufzeiten, ruhiger Board-Ton, verschlüsselter Web Push und persönliche Ruhezeiten fertig | optionale globale Standardwerte |
| Integrationen | Google, Microsoft, CalDAV, Home Assistant | Google iCal read-only und OAuth-Schreibzugriff fertig | CalDAV oder Microsoft Graph |
| Datenhoheit | lokaler Export, Import, Backups und Self-Hosting | portables Komplettarchiv mit Datenbank, Fotos, Schlüsseln, Prüfsummen und Rollback fertig | optional verschlüsselte Archivdateien |
| Hilfe und Barrierefreiheit | kontextbezogene Anleitungen, Tastatur, Kontrast, Screenreader, reduzierte Bewegung | zentrale rollenbewusste Hilfe und direkte Kontexthilfen fertig | vollständige automatisierte und manuelle Barrierefreiheitsprüfung |

## Empfohlene Produktreihenfolge

1. **Produktabschluss** – Geräte-Onboarding, kontextbezogene Hilfe, Barrierefreiheit und öffentliche Dokumentation.
2. **Kalenderkomfort** – zusätzliche Ansichten und weitere Kalenderintegrationen.
3. **Weitere Integrationen** – Apple/iCloud, Outlook, CalDAV und später Home Assistant.

## Qualitätsmaßstab

Ein Slice gilt erst als fertig, wenn Frontend, Live-API, Validierung, Fehlerzustände, responsive Touch-Bedienung, Migration und Dokumentation zusammen funktionieren. Platzhalterkarten allein zählen als vorbereitet, nicht als fertiges Feature.
