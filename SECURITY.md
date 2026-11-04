# Sicherheit

## Sicherheitsmeldungen

Bitte Sicherheitslücken nicht als öffentliches Issue veröffentlichen. Nutze einen privaten Security Advisory im GitHub-Repository oder kontaktiere den Repository-Eigentümer direkt. Gib betroffene Version, reproduzierbare Schritte und mögliche Auswirkungen an.

## Aktueller Sicherheitsstand

- Passwörter und Kinder-PINs werden nur mit PHP `password_hash` gespeichert.
- SQL-Zugriffe verwenden vorbereitete Statements.
- Öffentliche IDs sind UUIDs.
- `storage/` wird unter Apache vor direktem HTTP-Zugriff geschützt.
- Deployment-Secrets liegen in ignorierten lokalen Umgebungsdateien.
- Die Einrichtungs-API kann nur solange schreiben, wie noch kein Haushalt existiert.

Die Anwendung befindet sich im Aufbau. Vollständige Session-Authentifizierung und Rollenautorisierung sind der nächste priorisierte Sicherheitsslice. Bis dahin darf eine Instanz nur in einem vertrauenswürdigen Umfeld oder hinter zusätzlichem Webserver-Zugriffsschutz betrieben werden.

## Betreiberpflichten

- HTTPS erzwingen.
- FTP nach Möglichkeit durch FTPS ersetzen.
- `.env.deploy`, SQLite-Dateien, Backups und Logs niemals veröffentlichen.
- PHP-Fehleranzeige in Produktion deaktivieren.
- Schreibrechte auf `storage/` beschränken.
- Backups regelmäßig außerhalb des Webroots sichern und Restore testen.
- Updates zeitnah einspielen.

Unterstützte Versionen werden im [CHANGELOG.md](CHANGELOG.md) aufgeführt.
