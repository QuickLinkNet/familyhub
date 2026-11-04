# Datenbank

Die Anwendung speichert ihre Daten in `storage/database/app.sqlite`. Die Datei wird beim ersten API-Aufruf automatisch erstellt, wenn PHP Schreibrechte auf `storage/` besitzt und `pdo_sqlite` aktiviert ist.

Migrationen liegen in `api/database/migrations/` und werden in natürlicher Reihenfolge verarbeitet. Jede erfolgreich ausgeführte Datei wird in `schema_migrations` registriert; sie läuft danach nicht erneut. Vor neuen Migrationen erstellt die API eine SQLite-Kopie in `storage/backups/` und behält standardmäßig die 14 neuesten Sicherungen.

Neue Migrationen erhalten einen fortlaufenden Präfix, zum Beispiel `002_family_members.sql`. Sie müssen vor dem Eintrag in `schema_migrations` vollständig erfolgreich sein; die Ausführung erfolgt pro Datei in einer Transaktion.
