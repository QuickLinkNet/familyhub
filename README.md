# Familienkompass

Ein touchscreen-orientierter Familienorganizer als React-PWA mit nativer PHP-/SQLite-API. Phase 1 liefert die technische Grundlage und eine responsive Dashboard-OberflÃ¤che.

## Voraussetzungen

- Node.js 20+ fÃ¼r Entwicklung und den Produktions-Build
- PHP 8.2+ mit aktivierter Erweiterung `pdo_sqlite`
- Apache mit `mod_rewrite` fÃ¼r Production Routing

## Entwicklung

```bash
npm install
npm run dev
```

Der Vite-Server startet die OberflÃ¤che. FÃ¼r einen lokalen API-Test kann PHP den Projektordner bereitstellen:

```bash
C:\xampp\php\php.exe -S localhost:8080 api/dev-router.php
```

Danach liefert [http://localhost:8080/api/v1/health](http://localhost:8080/api/v1/health) die initialisierte Gesundheitsmeldung. FÃ¼r getrennte Entwicklungsserver setze `VITE_API_BASE_URL`, zum Beispiel in einer nicht versionierten `.env.local`.

## Produktions-Build und Deployment

```bash
npm run build
```

Lade den Inhalt von `dist/` in das Webroot hoch und lege die Ordner `api/` und `storage/` daneben ab. Apache benÃ¶tigt Schreibrechte auf `storage/database`, `storage/backups` und `storage/logs`. `storage/.htaccess` verhindert den direkten HTTP-Zugriff; bei einem Webserver ohne Apache muss die entsprechende Sperre dort konfiguriert werden.

Die erste Anfrage startet die Selbstinstallation: Ordner werden angelegt, die Datenbank wird erstellt und ausstehende Migrationen werden angewendet.

## Struktur

- `src/app` â€“ Router und App-Shell
- `src/components` â€“ wiederverwendbare UI-Bausteine
- `src/features` â€“ fachliche Frontend-Module
- `src/services` â€“ zentraler API-Zugang
- `api/` â€“ native PHP-API
- `storage/` â€“ geschÃ¼tzte Laufzeitdaten
- `docs/` â€“ Architektur-, Datenbank- und API-Dokumentation

Weitere Details: [Architektur](docs/ARCHITECTURE.md), [Datenbank](docs/DATABASE.md), [API](docs/API.md).
