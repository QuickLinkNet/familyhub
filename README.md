# Familienkompass

Familienkompass ist ein touch-optimierter, selbst hostbarer Familienorganizer. Die React-PWA bündelt Termine, Aufgaben und Personen in einer ruhigen Oberfläche; eine schlanke PHP-/SQLite-API hält Installation und Betrieb bewusst einfach.

## Aktueller Stand

- responsive PWA für Wanddisplay, Tablet und Mobilgerät
- gemeinsamer und persönlicher Familienkalender mit Wochen- und Monatsansicht sowie Terminverwaltung
- Google-Kalender wahlweise wartungsfrei read-only per iCal oder mit direktem OAuth-Schreibzugriff
- eigenständiger Wand- und Präsentationsmodus mit Uhrzeit, Terminen, Aufgaben und Familie
- geschützter Adminbereich für Kalenderquellen und Synchronisationsstatus
- Familienmitglieder mit Rollen, Farben, sicherem Elternpasswort und optionalem Kinder-PIN
- Touch-Anmeldung mit HttpOnly-Session, CSRF-Schutz und serverseitigen Rollenrechten
- Aufgaben und Morgen-/Abendroutinen mit Zuweisung, Wochentagen, automatischer Wiederholung, Priorität und abschließbarer Elternprüfung
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

Admins können unter `/admin` Google Kalender auf zwei Arten verbinden:

- Die **Geheime Adresse im iCal-Format** ist der einfache read-only Weg. FamilyHub prüft sie vor dem Speichern, legt sie verschlüsselt ab und überträgt sie nie wieder vollständig an das Frontend.
- Die optionale OAuth-Verbindung erlaubt, Google-Termine direkt am Familienboard zu erstellen, zu bearbeiten und zu löschen. Ein integrierter Schritt-für-Schritt-Assistent verlinkt jeden benötigten Bereich der Google Auth Platform, bietet Callback-URL und Berechtigungen kopierbar an und erklärt die erwarteten Zugangsdaten. Client-Secret, Refresh- und Access-Token werden verschlüsselt gespeichert; im Git-Repository liegen keinerlei Zugangsdaten.

Ausführlich: [Installation](docs/INSTALLATION.md), [Architektur](docs/ARCHITECTURE.md), [API](docs/API.md), [Datenbank](docs/DATABASE.md), [Sicherheit](SECURITY.md).

## Projektstruktur

- `src/app` – Router, Theme und App-Shell
- `src/components/atoms` – kleinste wiederverwendbare UI-Grundbausteine
- `src/components/molecules` – zusammengesetzte, fachlich neutrale UI-Muster
- `src/components/organisms` – größere wiederverwendbare Bereiche wie Navigation und App-Header
- `src/features` – fachliche Frontend-Module mit eigenen Komponenten, Hooks, Seiten und Typen
- `src/services` – zentraler API-Client
- `api/` – native PHP-API
- `storage/` – geschützte Laufzeitdaten
- `scripts/` – Build- und FTP-Deployment
- `docs/` – Produkt- und Technikdokumentation

Seiten bleiben reine Orchestratoren für Daten, Zustand und fachliche Komponenten. Neue Frontenddateien sollen eine klar abgegrenzte Verantwortung besitzen und möglichst deutlich unter 500 Zeilen bleiben.

## Mitwirken

Bitte [CONTRIBUTING.md](CONTRIBUTING.md) lesen. Sicherheitsprobleme gehören nicht in öffentliche Issues; Hinweise stehen in [SECURITY.md](SECURITY.md).

> Hinweis: Für das Repository ist noch keine Open-Source-Lizenz festgelegt. Kopieren, Weitergabe und kommerzielle Nutzung sind deshalb erst nach ausdrücklicher Freigabe erlaubt.
