# AGENTS.md

## Arbeitsbereich

Dieses Repository ist die maßgebliche FamilyHub-Codebasis. Änderungen werden direkt hier umgesetzt, gebaut, dokumentiert und nach erfolgreicher Prüfung committed.

## Verbindlicher Testweg

- Frontend ausschließlich im eingebauten Browser der lokalen Codex-App unter `http://localhost:5173/` prüfen.
- Backend ausschließlich gegen die in `.env.local` konfigurierte Live-API prüfen.
- Keinen lokalen PHP-Backend-Server starten.
- Eine echte Ersteinrichtung niemals mit erfundenen Familiendaten abschließen.

## Qualität

- Vor Übergabe `npm run build` ausführen.
- Neue PHP-Dateien mit `php -l` prüfen.
- Das Repository ist öffentlich: keine privaten Domains, echten Familiennamen, Zugangsdaten oder installationsspezifischen Werte committen; Beispiele verwenden `example.org` und fiktive Personen.
- Migrationen nur als neue fortlaufende Datei ergänzen.
- Secrets, Laufzeitdaten, `dist/` und `deploy/` nicht committen.
- Sichtbare UI-Änderungen mindestens auf Desktop- und Mobilbreite prüfen.
- Deutsche Texte in echtem UTF-8 schreiben; keine Ersatzschreibweisen für Umlaute.

## Deployment

`npm run deploy` baut Frontend und API und lädt nach `/familyhub`. Bestehende Daten unter `storage/` müssen erhalten bleiben.
