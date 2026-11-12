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
14. mehrstufige Routinen mit Vorlagen, Tagesläufen und Schrittfortschritt
15. gemeinsame Familienpinnwand mit Urheberschaft, Priorität und Ablaufdatum
16. persönliche Wochenstundenpläne sowie datierte Hausaufgaben und Tests
17. wiederkehrende Haushaltsaufgaben mit Zuständigkeit und Abschlussjournal
18. konfigurierbarer Wandmodus und Metadaten für geschützte Familienfotos
19. gemeinsame Familienziele mit unveränderlichem Beitragsjournal
20. private Kalenderkennzeichnung sowie verschlüsselte Push-Abonnements, VAPID-Schlüssel und Zustellungsfingerprints

Vor ausstehenden Migrationen erstellt die API ein Backup unter `storage/backups/`. Standardmäßig bleiben die 14 neuesten Sicherungen erhalten.

Admins können dieselben konsistenten SQLite-Sicherungen unter **Administration → Datensicherung** manuell anlegen, herunterladen und wiederherstellen. Vor dem Einspielen prüft FamilyHub SQLite-Format, Datenbankintegrität und die notwendigen FamilyHub-Tabellen. Der aktuelle Stand wird nochmals automatisch gesichert; danach erfolgt der Austausch atomar vor dem Öffnen der nächsten Datenbankverbindung.

Für einen vollständigen Serverumzug erstellt **Administration → Portables Familienarchiv** eine `.familyhub`-Datei. Das ZIP-basierte Format enthält `manifest.json`, `database/app.sqlite`, aktive Dateien aus `photos/` und vorhandene Schlüssel unter `keys/`. Das Manifest führt Größe, Typ und SHA-256-Prüfsumme jeder Datei auf. Ein Import wird zunächst vollständig in einen geschützten Pending-Bereich extrahiert und erst beim nächsten API-Request gemeinsam aktiviert.

Erinnerungen werden zur Laufzeit aus Kalender-, Aufgaben-, Schul- und Routinedaten abgeleitet. Für Web Push speichert FamilyHub nur verbundene Browser, technische Zustellungszustände und kurzlebige Reminder-Fingerprints gegen Wiederholungsspam; es entsteht kein separates Familienaktivitätsprotokoll.

Neue Migrationen erhalten einen fortlaufenden dreistelligen Präfix, beispielsweise `007_recurring_tasks.sql`. Jede Datei muss vollständig transaktional ausführbar sein.

## Zentrale Tabellen

- `app_settings` – technische Einstellungen
- `family_members` – Personen, Rollen, Farben, optionales Geburtsdatum und Login-Hashes
- `tasks` – Aufgaben, Status, Elternprüfung, Aufgabensterne sowie optionale Routine-Tageszeit, Wiederholungswochentage und Serienkennung
- `routine_templates` – wiederverwendbare Routinepläne mit Person, Tageszeit und Wochentagen
- `routine_steps` – geordnete Schritte einer Routinevorlage
- `routine_runs` – höchstens ein historisch stabiler Tageslauf je Vorlage und Datum
- `routine_run_steps` – kopierte Tageslaufschritte mit eigenem Abschlussstatus
- `rewards` – aktiver Belohnungskatalog mit Sternepreis, Symbol und Farbe
- `reward_ledger` – append-only Sternenjournal für Aufgabe, Bonus und Einlösung; Salden werden daraus berechnet
- `shopping_lists` – benannte, farbige Einkaufslisten des Haushalts
- `shopping_items` – Mengen, Ladenbereiche, Dringlichkeit und nachvollziehbarer Abhakstatus
- `meal_recipes` – Lieblingsgerichte mit Darstellung und Zubereitungszeit
- `meal_recipe_ingredients` – strukturierte Zutaten samt Menge und Einkaufsbereich
- `meal_plan_entries` – höchstens ein aktiver Eintrag je Datum und Mahlzeit
- `family_notes` – farbige Pinnwand-Zettel mit Urheber, Wichtig-Markierung, Ablaufdatum und weichem Löschen
- `school_lessons` – wiederkehrende Unterrichtsstunden je Person und Wochentag
- `school_items` – Hausaufgaben und Tests mit Fälligkeit, Abschlussstatus und Personenzuordnung
- `household_chores` – aktive Haushaltsaufgaben mit Kategorie, Zuständigkeit, Fälligkeit und Wiederholung
- `household_chore_completions` – unveränderliche Erledigungshistorie mit geplantem Datum und ausführender Person
- `wall_presentation_settings` – einzelner Datensatz für Familiengruß, Wetteroption und aufgelöste Ortskoordinaten
- `wall_photos` – Metadaten der geschützten Präsentationsbilder; die Dateien liegen unter `storage/wall-photos`
- `family_goals` – gemeinsame Ziele mit Darstellung, Zielgröße, Termin und Abschlussstatus
- `family_goal_contributions` – append-only Fortschrittsjournal mit Person, Schrittzahl und Zeitpunkt
- `households` – Haushalt, Locale, Zeitzone und Setup-Zeitpunkt
- calendars – gemeinsamer sowie persönliche Kalender
- `calendar_events` – Termine, Zeiträume, Orte, Ersteller, Privatkennzeichnung und optionale Wiederholungsregel
- `calendar_sources` – verschlüsselte Google-iCal-Verbindungen und Synchronisationsstatus
- `external_calendar_events` – lokal zwischengespeicherte read-only Termine externer Quellen
- `google_oauth_connections` – verschlüsselte OAuth-Konfiguration, Tokens und kurzlebiger State
- `google_calendar_sources` – verfügbare Google-Kalender, Auswahl, Rechte und Synchronisationsstatus
- `google_calendar_events` – lokal zwischengespeicherte Google-Termine mit externer Kennung
- `push_vapid_keys` – öffentliches VAPID-Material und verschlüsselter privater Signaturschlüssel
- `push_subscriptions` – verschlüsselte Browser-Endpunkte und Schlüssel je Familienprofil und Gerät
- `push_deliveries` – technische, automatisch bereinigte Fingerprints bereits versandter Reminder
- `auth_login_attempts` – begrenzte Fehlversuche und zeitweilige Login-Sperren
- `schema_migrations` – angewendete Migrationen

## Datenschutz und Backups

Die SQLite-Datei und Backups dürfen niemals committed oder direkt über HTTP ausgeliefert werden. `storage/.htaccess` sperrt den Zugriff unter Apache. Bei anderen Webservern muss eine gleichwertige Regel eingerichtet werden.

Admin-Downloads werden ausschließlich über authentifizierte API-Routen ausgeliefert. Eine reine Datenbanksicherung enthält auch verschlüsselte Kalenderzugänge, jedoch nicht die Schlüsseldateien `storage/calendar-source.key` und `storage/application-secrets.key`. Das portable Familienarchiv nimmt vorhandene Schlüssel automatisch auf und ist deshalb die vorgesehene Lösung für einen vollständigen Serverumzug.

Das Komplettarchiv ist nicht zusätzlich verschlüsselt, damit es ohne proprietäre Werkzeuge portabel bleibt. Es enthält vertrauliche Daten und muss lokal verschlüsselt gespeichert oder in einem entsprechend geschützten Backup-Ziel abgelegt werden.

Vor einem manuellen Restore Anwendung kurz in den Wartungsmodus versetzen, die aktuelle Datenbank separat sichern und anschließend Health sowie Setup-Status prüfen.
