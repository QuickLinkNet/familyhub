# Feature-Übersicht

Status: **fertig** = vollständig benutzbarer Slice, **geplant** = bewusst noch nicht begonnen, **vorbereitet** = Architektur oder Navigation vorhanden, aber keine Fachfunktion.

## Produktumfang

| Bereich | Vorgabe | Status | Nächster sinnvoller Ausbauschritt |
| --- | --- | --- | --- |
| Technische Basis | React-PWA, PHP-API, SQLite, Migrationen, Backups, Logs, Health | fertig | Live-Deployment und Monitoring nutzen |
| Touch-/Kiosk-UX | Responsive Shell, Desktop-/Tablet-/Mobile-Navigation | fertig | Leerlaufmodus ergänzen |
| Dashboard | Tagesübersicht, modulare Karten | vorbereitet | Karten mit echten Kalender-/Aufgaben-/Einkaufsdaten versorgen |
| Familienmitglieder | Rollen, Farbe, Aktivstatus, PIN-Hash, Avatar | fertig | Avatar-Upload und Profilbearbeitung |
| Authentifizierung | Elternpasswort, Kinder-PIN, Sessions, Rechte | geplant | Als nächstes vor allen privaten Live-Daten umsetzen |
| Aufgaben | Zuweisung, Fälligkeit, Priorität, Erledigung, Eltern-Check | fertig | Bearbeiten, Eltern-Freigabe, Wiederholung, Historie und Belohnungen |
| Routinen | Wochentage, Schritte, Fortschritt | geplant | Morgen-/Abendroutine mit abhackbareren Schritten |
| Belohnungen | Punkte/Münzen/Sterne, spätere Family-Island-Anbindung | geplant | Einheitliches Punkte-Ledger definieren |
| Kalender | Lokale Termine, Ansichten, Wiederholung, Anbieter-Adapter | geplant | Lokaler Wochen-/Tageskalender als erster Slice |
| Einkauf | Mehrere Listen, Kategorien, Mengen, schnelles Abhaken | geplant | Gemeinsame Standardliste |
| Mahlzeiten & Rezepte | Wochenplan, Rezepte, Zutaten in Einkauf übernehmen | geplant | Wochenplan plus Abendessen |
| Notizen | Familiennotizen und schnelle Hinweise | geplant | Einfache Notizliste |
| Schule | Stundenplan, Hausaufgaben, Tests, Ferien | geplant | Hausaufgaben als fokussierter erster Slice |
| Haushalt | Putzen, Müll, Pflanzen, Wäsche, Tiere | geplant | Müllkalender oder Putzplan auswählen |
| Wetter | Dashboard-Wetter per Anbieter-Adapter | geplant | Datenschutzfreundlichen Wetteradapter wählen |
| Foto-/Idle-Modus | Diashow mit Zeit, Wetter, nächstem Termin | geplant | Inaktivitäts-Timer und lokaler Bildordner |
| Benachrichtigungen | In-App, Browser, später Push | geplant | In-App-Erinnerungen nach Authentifizierung |
| Externe Dienste | Google, Outlook, CalDAV, Home Assistant, Family Island | geplant | Erst nach lokalem Kalender über Adapter anbinden |

## Empfohlene Reihenfolge

1. **Authentifizierung und Rechte** – schützt das Live-System und ermöglicht Kinder-PINs.
2. **Aufgaben vervollständigen** – Bearbeiten, Eltern-Freigabe, Wiederholung und Punkte.
3. **Lokaler Kalender** – der Kern für die tägliche Übersicht.
4. **Routinen** – besonders wertvoll für den Touchscreen und Kinder.
5. **Einkauf sowie Essensplanung** – gemeinsamer Alltagsnutzen.
6. **Notizen, Schule, Haushalt** – jeweils als kleine unabhängige Slices.
7. **Foto-/Idle-Modus, Wetter und Integrationen** – erst auf der stabilen Basis.