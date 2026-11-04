# Familienkompass

Familienkompass ist ein touch-optimierter, selbst hostbarer Familienorganizer. Die React-PWA bündelt Termine, Aufgaben und Personen in einer ruhigen Oberfläche; eine schlanke PHP-/SQLite-API hält Installation und Betrieb bewusst einfach.

## Aktueller Stand

- responsive PWA für Wanddisplay, Tablet und Mobilgerät
- Familienmitglieder mit Rollen, Farben, sicherem Elternpasswort und optionalem Kinder-PIN
- Touch-Anmeldung mit HttpOnly-Session, CSRF-Schutz und serverseitigen Rollenrechten
- Aufgaben mit Zuweisung, Priorität, Fälligkeit und Elternprüfung
- einmaliger Einrichtungsassistent für Haushalt, Personen und persönliche Kalender
- selbstinitialisierende PHP-/SQLite-API mit Migrationen, Backups, Logs und Health-Check
- reproduzierbarer FTP-Deploy per `npm run deploy`

Die vollständige Produkt-Roadmap steht in [docs/FEATURES.md](docs/FEATURES.md).

## Schnellstart für die Entwicklung

Voraussetzungen: Node.js 20+ und eine bereits bereitgestellte Live-API.

```bash
npm install
copy .env.local.example .env.local
npm run dev
```

Trage in `.env.local` die URL deiner Live-API ein. Der Entwicklungsserver läuft standardmäßig unter [http://localhost:5173](http://localhost:5173). In diesem Projekt wird bewusst kein lokaler PHP-Server verwendet.

## Deployment

```bash
copy .env.deploy.example .env.deploy
npm run deploy
```

Der Befehl prüft TypeScript, baut die PWA, erstellt `deploy/` und lädt Frontend sowie API per FTP hoch. Bestehende Laufzeitdaten unter `storage/` werden nicht gelöscht. Zugangsdaten bleiben in der ignorierten Datei `.env.deploy`.

Nach dem ersten Deployment führt `/setup` durch Haushalt, Familienmitglieder und Kalender. Danach melden sich Erwachsene mit Passwort und Kinder mit ihrer optionalen PIN über die Profilauswahl an. Die Installation ist transaktional und kann nur einmal abgeschlossen werden.

Ausführlich: [Installation](docs/INSTALLATION.md), [Architektur](docs/ARCHITECTURE.md), [API](docs/API.md), [Datenbank](docs/DATABASE.md), [Sicherheit](SECURITY.md).

## Projektstruktur

- `src/app` – Router, Theme und App-Shell
- `src/components` – wiederverwendbare UI-Bausteine
- `src/features` – fachliche Frontend-Module
- `src/services` – zentraler API-Client
- `api/` – native PHP-API
- `storage/` – geschützte Laufzeitdaten
- `scripts/` – Build- und FTP-Deployment
- `docs/` – Produkt- und Technikdokumentation

## Mitwirken

Bitte [CONTRIBUTING.md](CONTRIBUTING.md) lesen. Sicherheitsprobleme gehören nicht in öffentliche Issues; Hinweise stehen in [SECURITY.md](SECURITY.md).

> Hinweis: Für das Repository ist noch keine Open-Source-Lizenz festgelegt. Kopieren, Weitergabe und kommerzielle Nutzung sind deshalb erst nach ausdrücklicher Freigabe erlaubt.
