# Beitragen

Danke, dass du Familienkompass verbessern möchtest.

## Entwicklungsregeln

- Node.js 20+ verwenden und Abhängigkeiten mit `npm install` installieren.
- Frontend lokal über `npm run dev` starten.
- Backend- und Integrationstests ausschließlich gegen eine explizit konfigurierte Live-API durchführen; keinen lokalen PHP-Server voraussetzen.
- Secrets nur in ignorierten `.env.*`-Dateien ablegen.
- Keine privaten Domains, echten Familiennamen oder installationsspezifischen Werte eintragen; Dokumentation und Tests verwenden `example.org` und fiktive Personen.
- Fachcode unter `src/features/<modul>/` beziehungsweise in Controller/Service/Repository-Schichten strukturieren.
- Datenbankänderungen ausschließlich als neue, fortlaufende Migration hinzufügen.
- UI für Touch, Tastatur und kleine Displays prüfen.

## Vor einem Commit

```bash
npm run build
```

Zusätzlich:

- neue PHP-Dateien mit `php -l` prüfen,
- API-Smoke-Tests gegen eine Testinstallation ausführen,
- sichtbare Änderungen im eingebauten Browser auf Desktop- und Mobilbreite prüfen,
- Dokumentation und Changelog aktualisieren.

## Commits

Kurze, fachliche Conventional-Commit-Nachrichten sind erwünscht, zum Beispiel:

```text
feat: add calendar week view
fix: preserve storage during ftp deploy
docs: explain setup recovery
```

## Pull Requests

Beschreibe Problem, Lösung, Testweg und mögliche Migrationsfolgen. Screenshots helfen bei sichtbaren Änderungen. Vermische keine unabhängigen Refactorings mit einem Feature-Fix.
