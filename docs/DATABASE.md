# Datenbank

Familienkompass speichert Laufzeitdaten in `storage/database/app.sqlite`. Die Datei wird beim ersten API-Aufruf angelegt, sofern PHP Schreibrechte besitzt und `pdo_sqlite` aktiv ist.

## Migrationen

Migrationen liegen in `api/database/migrations/` und laufen in natürlicher Reihenfolge. Erfolgreiche Dateien werden in `schema_migrations` registriert und nicht erneut ausgeführt.

Aktuelle Entwicklung:

1. Kernschema und Einstellungen
2. Familienmitglieder
3. Aufgaben
4. Haushalt, Erwachsenenpasswörter und Kalender
5. Login-Sperren und Authentifizierungsgrundlage
6. Kalendertermine und Zeitraumindizes

Vor ausstehenden Migrationen erstellt die API ein Backup unter `storage/backups/`. Standardmäßig bleiben die 14 neuesten Sicherungen erhalten.

Neue Migrationen erhalten einen fortlaufenden dreistelligen Präfix, beispielsweise `007_recurring_tasks.sql`. Jede Datei muss vollständig transaktional ausführbar sein.

## Zentrale Tabellen

- `app_settings` – technische Einstellungen
- `family_members` – Personen, Rollen, Farben und Login-Hashes
- `tasks` – Aufgaben und Status
- `households` – Haushalt, Locale, Zeitzone und Setup-Zeitpunkt
- calendars – gemeinsamer sowie persönliche Kalender
- `calendar_events` – Termine, Zeiträume, Orte und Ersteller
- `auth_login_attempts` – begrenzte Fehlversuche und zeitweilige Login-Sperren
- `schema_migrations` – angewendete Migrationen

## Datenschutz und Backups

Die SQLite-Datei und Backups dürfen niemals committed oder direkt über HTTP ausgeliefert werden. `storage/.htaccess` sperrt den Zugriff unter Apache. Bei anderen Webservern muss eine gleichwertige Regel eingerichtet werden.

Vor einem manuellen Restore Anwendung kurz in den Wartungsmodus versetzen, die aktuelle Datenbank separat sichern und anschließend Health sowie Setup-Status prüfen.
