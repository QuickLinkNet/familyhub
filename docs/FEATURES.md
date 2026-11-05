# Produkt- und Feature-Roadmap

Status: **fertig** = benutzbarer End-to-End-Slice, **in Arbeit** = aktiv vorbereitet, **vorbereitet** = Navigation oder Architektur vorhanden, **geplant** = noch nicht begonnen.

## Vergleich zum Daely-Produktbild

Der Vergleich basiert auf den sichtbaren Produktmerkmalen des als Referenz genannten digitalen Familienkalenders. Familienkompass soll nicht nur kopieren, sondern mit Selbsthosting, Datenschutz und frei kombinierbaren Familienmodulen darüber hinausgehen.

| Referenzfunktion | Familienkompass-Ziel | Status |
| --- | --- | --- |
| zentraler Familienkalender | gemeinsamer Kalender plus persönlicher Kalender je Person | Wochen- und Monatsansicht sowie Termin-CRUD fertig |
| farbige Personen und Termine | feste Personenfarben in Kalender, Aufgaben und Dashboard | fertig |
| Kinder haken Aufgaben selbst ab | Touch-große Aufgaben, Kinder-PIN und optionaler Eltern-Check | Aufgaben-Grundlage fertig |
| Google-, Apple- oder Outlook-Anbindung | Adapter für Google Calendar, Microsoft Graph und CalDAV | Google iCal read-only fertig; OAuth/CalDAV geplant |
| Wanddisplay plus mobile Nutzung | responsive installierbare PWA für Display, Tablet und Smartphone | fertig |
| schnelle Ersteinrichtung | Assistent für Haushalt, Rollen, Passwörter und Kalender | fertig |
| laufende Produktupdates | Migrationen, Backups und reproduzierbares Deployment | fertig |

## Familienkompass-Umfang

| Bereich | Geplanter Funktionsumfang | Status | Nächster Slice |
| --- | --- | --- | --- |
| Plattform | React-PWA mit Atomic Design, PHP-API, SQLite, Migrationen, Backups, Logs, Health | fertig | automatisierte Smoke-Tests |
| Installation | Haushalt, 1–12 Personen, Rollen, sichere Zugangsdaten, Kalender | fertig | Export/Import und Reset-Werkzeug |
| Touch-/Kiosk-UX | Wanddisplay, Tablet, Mobilnavigation, große Ziele | Wand- und Präsentationsmodus fertig | Leerlauf- und Fotomodus |
| Dashboard | Heute, Aufgaben, Familie und direkter Wandmodus | fertig | konfigurierbare Karten und Wetter |
| Identität & Rechte | Admin-/Elternpasswort, Kinder-PIN, Sessions, CSRF, Rollenrechte | fertig | Profilbearbeitung und feinere Modulrechte |
| Aufgaben | Zuweisung, Fälligkeit, Priorität, Abschluss, Eltern-Check | fertig | Bearbeiten, Freigabe, Wiederholung, Historie |
| Belohnungen | Punkte, Sterne oder Münzen mit nachvollziehbarem Ledger | geplant | Punkte für geprüfte Aufgaben |
| Kalender | Tag/Woche/Monat, Wiederholungen, Geburtstage, Ferien | Woche und Monat fertig | Tagesansicht, Wiederholungen und Import |
| Routinen | Morgen-/Abendroutine, Schritte, Wochentage, Fortschritt | geplant | Routine-Builder und Kinderansicht |
| Einkauf | mehrere Listen, Kategorien, Mengen, schnelles Abhaken | geplant | gemeinsame Standardliste |
| Mahlzeiten & Rezepte | Wochenplan, Rezepte, Zutatenübernahme | geplant | Abendessen-Wochenplan |
| Notizen | Familiennotizen, Pinnwand und schnelle Hinweise | geplant | Notizliste |
| Schule | Stundenplan, Hausaufgaben, Tests, Ferien | geplant | Hausaufgaben-Slice |
| Haushalt | Putzen, Müll, Pflanzen, Wäsche und Tiere | geplant | Putz- oder Müllplan |
| Wetter | aktuelle Lage und Vorschau über austauschbaren Anbieter | geplant | datenschutzfreundlicher Adapter |
| Foto-/Idle-Modus | Diashow, Uhrzeit, Wetter und nächster Termin | geplant | Inaktivitäts-Timer |
| Benachrichtigungen | In-App, Browser und später Web Push | geplant | In-App-Erinnerungen |
| Integrationen | Google, Microsoft, CalDAV, Home Assistant | Google iCal read-only fertig | Google OAuth oder CalDAV mit Schreibzugriff |
| Datenhoheit | lokaler Export, Import, Backups und Self-Hosting | teilweise fertig | nutzerfreundlicher Export/Restore |
| Barrierefreiheit | Tastatur, Kontrast, Screenreader, reduzierte Bewegung | in Arbeit | automatisierte und manuelle Prüfung |

## Empfohlene Produktreihenfolge

1. **Kalender ausbauen** – Tagesansicht, lokale Wiederholungen, Geburtstage und OAuth-/CalDAV-Anbindung.
2. **Aufgaben vervollständigen** – Bearbeitung, Elternfreigabe, Wiederholung und Punkte.
3. **Routinen** – starker täglicher Nutzen für Kinder und Wanddisplay.
4. **Einkauf und Essensplanung** – gemeinsamer Haushaltsnutzen.
5. **Notizen, Schule und Haushalt** – kleine unabhängige Module.
6. **Idle-Modus, Wetter und Integrationen** – nach stabilem lokalem Kern.

## Qualitätsmaßstab

Ein Slice gilt erst als fertig, wenn Frontend, Live-API, Validierung, Fehlerzustände, responsive Touch-Bedienung, Migration und Dokumentation zusammen funktionieren. Platzhalterkarten allein zählen als vorbereitet, nicht als fertiges Feature.
