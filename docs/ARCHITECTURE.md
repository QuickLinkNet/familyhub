# Architektur

Familienkompass besteht aus zwei gemeinsam deploybaren, technisch klar getrennten Teilen:

- React/Vite erzeugt eine statische, installierbare PWA.
- Eine native PHP-API liefert JSON unter `/api/v1/` und speichert in SQLite.

## Frontend

React Router übernimmt Navigation und den konfigurierbaren Hosting-Basispfad. Material UI bildet das Designsystem; TanStack Query verwaltet Serverzustand und Caching. Fachmodule liegen unter `src/features/<modul>/` und enthalten nach Bedarf `api`, `components`, `hooks`, `pages` und `types`.

`src/services/apiClient.ts` ist der zentrale HTTP-Zugang. Das Frontend kommuniziert in Entwicklung und Test ausschließlich mit der konfigurierten Live-API.

Der `SetupGate` lädt vor privaten Seiten den Installationsstatus. Eine frische Instanz wird nach `/setup` geleitet; eine abgeschlossene Instanz kann den Assistenten nicht erneut öffnen.

## Backend

Die Schichten bleiben bewusst klein:

```text
Router → Controller → Service → Repository → SQLite
```

Bootstrap, Fehlerbehandlung, JSON-Antworten, Migrationen, Backups und Logging sind gemeinsame Kernbausteine. Fachlogik gehört nicht in Controller oder SQL-Strings im Routing.

Die Einrichtung von Haushalt, Personen und Kalendern läuft in einer einzelnen Datenbanktransaktion. Passwörter und PINs werden mit PHP `password_hash` gespeichert.

## Deployment

`npm run build` erzeugt die PWA und ein vollständiges `deploy/`-Paket. `npm run deploy` überträgt dieses Paket per FTP/FTPS. Der geschützte `storage/`-Bereich liegt neben API und Frontend, aber außerhalb der statischen Build-Ausgabe.

Externe Kalender, Wetterdienste und Smart-Home-Systeme werden später hinter fachlichen Adapter-Interfaces angebunden, damit der lokale Kern unabhängig bleibt.
