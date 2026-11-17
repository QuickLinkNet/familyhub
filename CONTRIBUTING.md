# Zu FamilyHub beitragen

Danke für dein Interesse an FamilyHub. Beiträge sollen klein, nachvollziehbar und ohne private Installationsdaten bleiben.

## Vor dem Start

1. Prüfe vorhandene Issues und die [Feature-Roadmap](docs/FEATURES.md).
2. Beschreibe größere Funktions- oder Architekturänderungen zuerst in einem Issue.
3. Verwende für einen Pull Request einen eigenen Branch mit klarer Aufgabe.

## Lokale Entwicklung

Voraussetzungen sind Node.js 20+ und eine explizit konfigurierte FamilyHub-Test-API.

```bash
npm ci
cp .env.local.example .env.local
npm run dev
```

Secrets gehören ausschließlich in ignorierte `.env.*`-Dateien. Starte für dieses Repository keinen improvisierten PHP-Entwicklungsserver mit produktionsnahen Familiendaten.

## Architekturregeln

- Frontend-Fachcode liegt unter `src/features/<modul>/`.
- Wiederverwendbare UI folgt Atomic Design unter `src/components/`.
- Designwerte kommen aus `src/theme/`; Feature-Komponenten erhalten keine neuen hart codierten Farben, Schatten, Radien oder Breakpoints.
- PHP bleibt frameworkfrei und folgt den vorhandenen Controller-/Service-/Repository-Schichten.
- Datenbankänderungen werden ausschließlich als neue, fortlaufende Migration ergänzt.
- Dateien erhalten eine klar abgegrenzte Verantwortung und bleiben möglichst deutlich unter 500 Zeilen.

## Datenschutz

Das Repository ist öffentlich. Verwende ausschließlich `example.org`, fiktive Personen und bereinigte Screenshots. Niemals committen:

- private Domains oder Installationspfade,
- echte Namen oder Kalenderinhalte,
- Passwörter, Tokens, OAuth-Secrets oder iCal-Adressen,
- SQLite-Dateien, Archive, Laufzeitlogs oder Backups.

## Designänderungen

Neue Screendesigns werden unter `design/screens/` versioniert. Eine Implementierung beginnt erst nach expliziter Freigabe der jeweiligen Version. Private Entwürfe und Screenshots bleiben außerhalb des öffentlichen Repositories.

## Prüfung

Vor einem Pull Request mindestens:

```bash
npm run test:deploy-config
npm run build
```

Zusätzlich abhängig von der Änderung:

- geänderte PHP-Dateien mit `php -l` prüfen,
- relevante Smoke-Tests unter `api/tests/` ausführen,
- sichtbare Änderungen auf Desktop- und Mobilbreite testen,
- Dokumentation und Changelog aktualisieren.

Die GitHub-Actions-Pipeline wiederholt Production-Build, PHP-Lint und Smoke-Tests automatisch.

## Commits und Pull Requests

Verwende kurze Conventional-Commit-Nachrichten, zum Beispiel:

```text
feat: add calendar week view
fix: preserve storage during ftp deploy
docs: clarify oauth setup
```

Ein Pull Request beschreibt Ziel, Änderungen, Prüfung und mögliche Migrations- oder Konfigurationsfolgen. Vermische keine unabhängigen Refactorings mit einem Feature oder Fix.

## Sicherheit

Sicherheitslücken gehören nicht in öffentliche Issues. Nutze den vertraulichen Meldeweg aus [SECURITY.md](SECURITY.md).
