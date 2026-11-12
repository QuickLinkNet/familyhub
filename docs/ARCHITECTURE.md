# Architektur

Familienkompass besteht aus zwei gemeinsam deploybaren, technisch klar getrennten Teilen:

- React/Vite erzeugt eine statische, installierbare PWA.
- Eine native PHP-API liefert JSON unter `/api/v1/` und speichert in SQLite.

## Frontend

React Router übernimmt Navigation und den konfigurierbaren Hosting-Basispfad. Material UI bildet das Designsystem; zentrale Produktwerte für Farben, Radien, Schatten, Oberflächen und Touch-Ziele liegen in `src/theme/designTokens.ts`, die MUI-Komponentenregeln in `src/theme/appTheme.ts`. TanStack Query verwaltet Serverzustand und Caching. Fachmodule liegen unter `src/features/<modul>/` und enthalten nach Bedarf `api`, `components`, `constants`, `hooks`, `pages`, `types` und `utils`.

Die wiederverwendbare UI folgt Atomic Design:

```text
src/components/
├── atoms/       kleinste visuelle Bausteine ohne Fachlogik
├── molecules/   wiederkehrende Kombinationen wie Seitenkopf oder Leerzustand
└── organisms/   vollständige, wiederverwendbare Bereiche wie App-Navigation
```

Feature-spezifische Moleküle und Organismen bleiben bewusst beim jeweiligen Modul. Dadurch kennt zum Beispiel der globale Komponentenordner keine Kalender- oder Aufgabenlogik. `pages` laden Daten, verwalten Seitenzustand und komponieren die Bausteine; umfangreiche Darstellung oder Formulare gehören in `components`.

Frontenddateien erhalten genau eine klar erkennbare Verantwortung und sollen möglichst deutlich unter 500 Zeilen bleiben. Ein Split erfolgt entlang fachlicher oder visueller Grenzen, nicht nur um eine Zeilenzahl zu erfüllen.

`src/services/apiClient.ts` ist der zentrale HTTP-Zugang. Das Frontend kommuniziert in Entwicklung und Test ausschließlich mit der konfigurierten Live-API.

Der `SetupGate` lädt vor privaten Seiten den Installationsstatus. Eine frische Instanz wird nach `/setup` geleitet; eine abgeschlossene Instanz kann den Assistenten nicht erneut öffnen.

## Backend

Die Schichten bleiben bewusst klein:

```text
Router → Controller → Service → Repository → SQLite
```

Bootstrap, Fehlerbehandlung, JSON-Antworten, Migrationen, Backups und Logging sind gemeinsame Kernbausteine. Fachlogik gehört nicht in Controller oder SQL-Strings im Routing.

Die Einrichtung von Haushalt, Personen und Kalendern läuft in einer einzelnen Datenbanktransaktion. Passwörter und PINs werden mit PHP `password_hash` gespeichert.

Das Belohnungssystem verwendet ein append-only Journal statt veränderlicher Punktezähler. Aufgabenabschluss, Folge-Routine und optionale Sternegutschrift laufen in derselben Transaktion. Dadurch bleiben Salden nachvollziehbar, doppelte Aufgabenpunkte ausgeschlossen und Einlösungen revisionsfähig.

Mehrstufige Routinen sind ein eigener Fach-Slice neben Einzelaufgaben. Eine wiederverwendbare Vorlage besitzt geordnete Schritte und Wochentage; pro fälligem Datum entsteht genau ein Tageslauf mit kopierten Schritten. Dadurch bleiben begonnene Abläufe stabil, während Bearbeiten oder Pausieren der Serie nur zukünftige Läufe beeinflusst. Schrittabschluss und finaler Laufstatus werden atomar in einer Transaktion geschrieben.

Einkaufslisten sind ein eigener End-to-End-Slice. Die API liefert Listen samt Artikeln in einem für die Touch-Oberfläche optimierten Aggregat; Sortierung nach Status, Dringlichkeit und Ladenbereich erfolgt zentral im Repository. Einzelne Artikel dürfen alle angemeldeten Familienmitglieder bedienen, strukturelle Listenoperationen erzwingt der Router ausschließlich für Erwachsene.

Der Essensplan ergänzt den Einkauf über strukturierte Rezeptzutaten. Plan-Slots sind pro Datum und Mahlzeit eindeutig und werden beim erneuten Planen gezielt ersetzt. Die Übernahme eines Gerichts erzeugt sämtliche Einkaufsartikel in einer Transaktion, damit niemals nur ein Teil der Zutaten in der Liste landet.

Die Familienpinnwand ist ein eigenständiger End-to-End-Slice. Zettel bleiben ihrem Ersteller zugeordnet, wichtige Hinweise werden zentral priorisiert und optionale Ablaufdaten filtern veraltete Informationen bereits im Repository. Erwachsene moderieren die gesamte Pinnwand; Kinder dürfen ausschließlich eigene Beiträge verändern oder entfernen.

Das Schulmodul trennt den stabilen, wöchentlich wiederkehrenden Stundenplan von datierten Hausaufgaben und Tests. Unterrichtsstunden gehören zu genau einem Familienmitglied und dürfen nur durch Erwachsene strukturell verändert werden. Schuleinträge dürfen Kinder für das eigene Profil pflegen und abschließen; der Service erzwingt diese Grenze unabhängig von der Oberfläche.

Lokale Kalenderwiederholungen bleiben als kompakte Serie in `calendar_events` gespeichert. Ein eigener Expander erzeugt nur die im angefragten Zeitraum sichtbaren Vorkommen; eine Serien-ID hält Bearbeiten und Löschen eindeutig. Geburtstage werden aus dem optionalen Geburtsdatum aktiver Familienprofile als schreibgeschützte virtuelle Kalenderereignisse erzeugt.

Private Termine behalten ihre Zeit und Kalenderfarbe, werden für Kinder aber bereits im Backend auf einen neutralen Titel ohne Beschreibung oder Ort reduziert. Dieselbe rollenabhängige Sicht wird für Kalender, Familienradar und Push-Nachrichten verwendet.

## Web Push

Web Push bleibt ohne Drittanbieter und ohne Composer-Abhängigkeit:

```text
Familienradar → Scheduler → profilbezogene Geräte → verschlüsselte Web-Push-Nutzlast → Service Worker
```

Der Server erzeugt pro Installation ein P-256-VAPID-Schlüsselpaar. Endpunkte, Browser-Schlüssel, privater Schlüssel und Scheduler-Token liegen AES-256-GCM-verschlüsselt in SQLite; die eigentliche Nachricht wird nach RFC 8291 pro Browser mit ECDH, HKDF und AES-128-GCM verschlüsselt. Eine Versandhistorie verhindert Doppelnachrichten. Abgelaufene Geräte werden bei HTTP 404 oder 410 automatisch widerrufen, während ein optionaler Hosting-Cronjob die Prüfung im Hintergrund anstößt.

## Deployment

`npm run build` erzeugt die PWA und ein vollständiges `deploy/`-Paket. `npm run deploy` überträgt dieses Paket per FTP/FTPS. Der geschützte `storage/`-Bereich liegt neben API und Frontend, aber außerhalb der statischen Build-Ausgabe.

Weitere externe Dienste wie Wetter- und Smart-Home-Systeme werden später hinter fachlichen Adapter-Interfaces angebunden, damit der lokale Kern unabhängig bleibt.

## Externe Kalender

Google-Kalender werden über einen kleinen nativen iCal-Adapter eingebunden:

```text
Admin-API → URL-Prüfung → verschlüsselte Quelle → iCal-Abruf → Parser → lokaler read-only Cache
```

Nur direkte HTTPS-iCal-Adressen von `calendar.google.com` werden akzeptiert. DNS-Ziele, Antwortgröße, Redirects und Zeitlimits werden geprüft. Der geheime Link liegt AES-256-GCM-verschlüsselt in SQLite; der zufällige Schlüssel liegt separat im geschützten `storage/`. Das Frontend erhält ausschließlich einen neutralen URL-Hinweis.

Synchronisierte Termine werden für 90 Tage Vergangenheit und 730 Tage Zukunft materialisiert. Gängige tägliche, wöchentliche, monatliche und jährliche Wiederholungen, Ausnahmen und Google-Overrides werden verarbeitet. Kalenderabfragen aktualisieren aktive Quellen frühestens nach 30 Minuten; bei Fehlern bleibt der letzte erfolgreiche Cache verfügbar.

Für direkten Schreibzugriff ergänzt ein optionaler nativer OAuth-/REST-Adapter den iCal-Weg:

```text
Admin-Assistent → OAuth-Webflow → verschlüsselte Tokens → Google Calendar REST API → lokaler Cache
```

Die Anwendung verwendet keine Google-SDK- oder Composer-Laufzeitabhängigkeit. OAuth und Calendar API laufen über feste HTTPS-Endpunkte. Client-Secret, Access-/Refresh-Token und Kalenderkennungen sind AES-256-GCM-verschlüsselt; der `state` liegt nur kurzzeitig und gehasht vor. Der primäre Kalender wird nach der Verbindung automatisch aktiviert, weitere Kalender wählt der Admin einzeln aus. Der Cache deckt 90 Tage Vergangenheit und 730 Tage Zukunft ab und wird frühestens nach 15 Minuten erneut geladen. Lokale und Google-Termine teilen dieselbe öffentliche Kalender-API; der Service routet Mutationen anhand der Kalender- beziehungsweise Termin-ID an den passenden Adapter.
