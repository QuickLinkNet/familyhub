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
7. verschlüsselte externe Kalenderquellen und synchronisierte read-only Termine
8. verschlüsselte Google-OAuth-Verbindung, auswählbare Google-Kalender und lokaler Termincache
9. wiederkehrende Aufgabenserien und Tageszeit-Gruppen für Routinen
10. Aufgabensterne, Belohnungskatalog und unveränderliches Punktejournal
11. gemeinsame Einkaufslisten, kategorisierte Artikel und Abhakstatus
12. Lieblingsgerichte, strukturierte Zutaten und Wochenplan-Slots
13. optionale Geburtstage sowie lokale Kalenderwiederholungen

Vor ausstehenden Migrationen erstellt die API ein Backup unter `storage/backups/`. Standardmäßig bleiben die 14 neuesten Sicherungen erhalten.

Neue Migrationen erhalten einen fortlaufenden dreistelligen Präfix, beispielsweise `007_recurring_tasks.sql`. Jede Datei muss vollständig transaktional ausführbar sein.

## Zentrale Tabellen

- `app_settings` – technische Einstellungen
- `family_members` – Personen, Rollen, Farben, optionales Geburtsdatum und Login-Hashes
- `tasks` – Aufgaben, Status, Elternprüfung, Aufgabensterne sowie optionale Routine-Tageszeit, Wiederholungswochentage und Serienkennung
- `rewards` – aktiver Belohnungskatalog mit Sternepreis, Symbol und Farbe
- `reward_ledger` – append-only Sternenjournal für Aufgabe, Bonus und Einlösung; Salden werden daraus berechnet
- `shopping_lists` – benannte, farbige Einkaufslisten des Haushalts
- `shopping_items` – Mengen, Ladenbereiche, Dringlichkeit und nachvollziehbarer Abhakstatus
- `meal_recipes` – Lieblingsgerichte mit Darstellung und Zubereitungszeit
- `meal_recipe_ingredients` – strukturierte Zutaten samt Menge und Einkaufsbereich
- `meal_plan_entries` – höchstens ein aktiver Eintrag je Datum und Mahlzeit
- `households` – Haushalt, Locale, Zeitzone und Setup-Zeitpunkt
- calendars – gemeinsamer sowie persönliche Kalender
- `calendar_events` – Termine, Zeiträume, Orte, Ersteller und optionale Wiederholungsregel
- `calendar_sources` – verschlüsselte Google-iCal-Verbindungen und Synchronisationsstatus
- `external_calendar_events` – lokal zwischengespeicherte read-only Termine externer Quellen
- `google_oauth_connections` – verschlüsselte OAuth-Konfiguration, Tokens und kurzlebiger State
- `google_calendar_sources` – verfügbare Google-Kalender, Auswahl, Rechte und Synchronisationsstatus
- `google_calendar_events` – lokal zwischengespeicherte Google-Termine mit externer Kennung
- `auth_login_attempts` – begrenzte Fehlversuche und zeitweilige Login-Sperren
- `schema_migrations` – angewendete Migrationen

## Datenschutz und Backups

Die SQLite-Datei und Backups dürfen niemals committed oder direkt über HTTP ausgeliefert werden. `storage/.htaccess` sperrt den Zugriff unter Apache. Bei anderen Webservern muss eine gleichwertige Regel eingerichtet werden.

Vor einem manuellen Restore Anwendung kurz in den Wartungsmodus versetzen, die aktuelle Datenbank separat sichern und anschließend Health sowie Setup-Status prüfen.
