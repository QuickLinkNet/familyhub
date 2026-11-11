# API

Basis: `/api/v1`. Antworten sind JSON und verwenden dieselbe Hülle.

Erfolg:

```json
{ "success": true, "data": {} }
```

Fehler:

```json
{
  "success": false,
  "error": { "code": "VALIDATION_ERROR", "message": "Sichere Fehlermeldung" }
}
```

## Öffentliche Endpunkte

- `GET /health` – System-, Datenbank- und Versionsstatus
- `GET /setup/status` – zeigt ausschließlich, ob die Ersteinrichtung offen ist
- `POST /setup` – einmalige transaktionale Installation
- `GET /auth/profiles` – aktive Profile für die Touch-Auswahl
- `GET /auth/me` – aktueller Sessionstatus
- `POST /auth/login` – Anmeldung mit Profil-ID und Passwort beziehungsweise PIN

`POST /setup` ist nach der ersten erfolgreichen Installation dauerhaft gesperrt und antwortet dann mit HTTP 409.

## Anmeldung

Login-Request:

```json
{
  "memberId": "uuid-des-profils",
  "secret": "Passwort oder PIN"
}
```

Die Antwort enthält das angemeldete Profil und einen CSRF-Token. Die Session-ID liegt ausschließlich im HttpOnly-Cookie. Nach fünf falschen Versuchen wird die Kombination aus Client und Profil für fünf Minuten gesperrt.

- Erwachsene melden sich mit mindestens acht Zeichen langem Passwort an.
- Kinder verwenden optional eine vier- bis achtstellige PIN.
- Kinder ohne PIN können ihr Profil direkt öffnen.

`POST /auth/logout` beendet die Session. Logout und alle weiteren schreibenden, authentifizierten Endpunkte erwarten den CSRF-Token im Header `X-CSRF-Token`.

## Geschützte Ressourcen

Alle Familien- und Aufgabenendpunkte benötigen eine gültige Session.

### Familienmitglieder

- `GET /family-members` – alle angemeldeten Rollen
- `POST /family-members` – Admin oder Elternteil
- `PUT /family-members/{uuid}` – Admin oder Elternteil
- `DELETE /family-members/{uuid}` – Admin oder Elternteil; das eigene aktive Profil ist geschützt

Create und Update akzeptieren `name`, `color`, `role`, `isActive`, optional `avatarUrl` und `birthDate` sowie rollenabhängig `password` oder `pin`. Geheimnisse werden ausschließlich als Passwort-Hash gespeichert.

### Familienpinnwand

- `GET /family-notes` – alle aktuell sichtbaren Zettel für angemeldete Rollen
- `POST /family-notes` – jedes angemeldete Profil pinnt einen Zettel an
- `PUT /family-notes/{uuid}` – Ersteller, Admin oder Elternteil bearbeitet einen Zettel
- `DELETE /family-notes/{uuid}` – Ersteller, Admin oder Elternteil entfernt einen Zettel weich

Ein Zettel enthält `title`, `body`, ein freigegebenes `icon` und `color`, optional `isImportant` sowie `expiresOn` im Format `YYYY-MM-DD`. Wichtige Hinweise stehen zuerst. Abgelaufene Zettel werden automatisch nicht mehr ausgeliefert. Kinder können fremde Zettel weder verändern noch löschen; Erwachsene dürfen die gesamte Familienpinnwand moderieren.

### Aufgaben

- `GET /tasks` – alle angemeldeten Rollen
- `POST /tasks` – Admin oder Elternteil
- `PUT /tasks/{uuid}` – Admin oder Elternteil
- `DELETE /tasks/{uuid}` – Admin oder Elternteil
- `POST /tasks/{uuid}/complete` – Erwachsene für jede Aufgabe; Kinder nur für die eigene zugewiesene Aufgabe
- `POST /tasks/{uuid}/verify` – Admin oder Elternteil bestätigt eine prüfpflichtige Erledigung

Create und Update akzeptieren neben den Aufgabendaten `rewardPoints` von 0 bis 100 sowie optional `routinePeriod` (`MORNING`, `AFTERNOON`, `EVENING`) und `repeatDays` als eindeutige ISO-Wochentage von 1 bis 7. Aufgaben mit Sternen müssen einer Person zugeordnet sein. Eine Routine benötigt mindestens einen Wochentag. Beim endgültigen Abschluss legt die API transaktional die nächste passende offene Ausführung an und überspringt bereits vergangene Wiederholungstage.

Eine prüfpflichtige Aufgabe wechselt beim Abschluss in `PENDING_VERIFICATION`. Erst die Elternbestätigung schließt sie endgültig ab und erzeugt bei einer Routine die nächste Ausführung.

### Mehrstufige Routinen

- `GET /routines` – heutige Tagesläufe und alle Vorlagen für angemeldete Rollen
- `POST /routines` – Admin oder Elternteil legt eine Vorlage an
- `PUT /routines/{uuid}` – Admin oder Elternteil bearbeitet oder pausiert eine Vorlage
- `DELETE /routines/{uuid}` – Admin oder Elternteil löscht eine Vorlage weich
- `POST /routine-runs/{runUuid}/steps/{stepUuid}/complete` – Erwachsene oder das zugeordnete Kinderprofil erledigt einen Schritt

Eine Vorlage enthält `title`, optional `description`, `assignedMemberId`, `routinePeriod`, ein nicht leeres `repeatDays` sowie 2 bis 12 geordnete `steps`. Pro Vorlage und geplantem Datum entsteht idempotent höchstens ein Tageslauf. Dessen Fortschritt wird aus den unveränderlich kopierten Tageslaufschritten berechnet; spätere Vorlagenänderungen beeinflussen erst neu erzeugte Läufe.

### Schatzkiste und Sterne

- `GET /rewards` – persönliche Sternenguthaben, aktiver Belohnungskatalog und jüngstes Sternenbuch
- `POST /rewards` – Admin oder Elternteil legt eine Belohnung an
- `DELETE /rewards/{uuid}` – Admin oder Elternteil entfernt eine Belohnung aus dem Katalog
- `POST /rewards/{uuid}/redeem` – Kinder für sich selbst; Erwachsene für das in `memberId` gewählte Familienmitglied
- `POST /rewards/bonus` – Admin oder Elternteil vergibt mit `memberId`, `points` und `reason` Bonussterne

Guthaben werden nie als überschreibbarer Zähler gespeichert, sondern aus dem append-only `reward_ledger` berechnet. Ein Aufgabenabschluss kann durch die eindeutige Aufgaben-ID höchstens eine Gutschrift erzeugen. Einlösungen werden serverseitig atomar gegen den aktuellen Saldo geprüft und können ihn nicht unter null senken.

### Einkaufslisten

- `GET /shopping-lists` – alle gemeinsamen Listen samt aktiven und abgehakten Artikeln
- `POST /shopping-lists` – Admin oder Elternteil legt eine Liste mit Name, Symbol und Farbe an
- `DELETE /shopping-lists/{uuid}` – Admin oder Elternteil entfernt eine Liste samt Artikeln
- `POST /shopping-lists/{uuid}/items` – jedes angemeldete Profil ergänzt einen Artikel
- `POST /shopping-lists/{uuid}/clear-checked` – Admin oder Elternteil entfernt alle abgehakten Artikel
- `PUT /shopping-items/{uuid}` – jedes angemeldete Profil bearbeitet einen offenen Artikel
- `POST /shopping-items/{uuid}/toggle` – jedes angemeldete Profil hakt einen Artikel ab oder öffnet ihn erneut
- `DELETE /shopping-items/{uuid}` – jedes angemeldete Profil entfernt einen Artikel

Artikel unterstützen `name`, optionale `quantity` und `note`, `isUrgent` sowie einen festen Ladenbereich in `category`. Die API protokolliert, wer einen Artikel ergänzt beziehungsweise abgehakt hat. Gelöschte Datensätze werden weich gelöscht und nicht mehr ausgeliefert.

### Essensplan und Lieblingsgerichte

- `GET /meal-planner?from={datum}&to={datum}` – Wochenplan und alle aktiven Lieblingsgerichte; maximal 31 Tage
- `POST /meal-recipes` – Admin oder Elternteil legt ein Gericht mit Zutaten an
- `DELETE /meal-recipes/{uuid}` – Admin oder Elternteil entfernt ein Lieblingsgericht
- `POST /meal-recipes/{uuid}/add-to-shopping` – jedes Profil überträgt alle Zutaten in `listId`
- `POST /meal-plan` – Admin oder Elternteil belegt oder ersetzt einen Slot
- `DELETE /meal-plan/{uuid}` – Admin oder Elternteil entfernt einen Planeintrag

Ein Planeintrag enthält `date`, `mealType` (`BREAKFAST`, `LUNCH`, `DINNER`), optional `recipeId`, andernfalls einen freien `title`, sowie eine optionale `note`. Pro Datum und Mahlzeit existiert höchstens ein aktiver Slot. Rezepte enthalten strukturierte Zutaten mit `name`, `quantity` und derselben `category` wie Einkaufsartikel. Die Zutatenübernahme läuft vollständig in einer SQLite-Transaktion.

### Schule

- `GET /school-board?from={datum}&to={datum}` – Wochenstundenplan sowie Hausaufgaben und Tests im Zeitraum; maximal 62 Tage
- `POST /school-lessons` – Admin oder Elternteil trägt eine wiederkehrende Unterrichtsstunde ein
- `PUT /school-lessons/{uuid}` – Admin oder Elternteil bearbeitet eine Unterrichtsstunde
- `DELETE /school-lessons/{uuid}` – Admin oder Elternteil entfernt eine Unterrichtsstunde weich
- `POST /school-items` – Erwachsene für jedes Profil, Kinder ausschließlich für sich selbst
- `PUT /school-items/{uuid}` – Erwachsene für jedes Profil, Kinder ausschließlich für sich selbst
- `POST /school-items/{uuid}/toggle` – einen eigenen beziehungsweise von Erwachsenen verwaltbaren Eintrag abschließen oder wieder öffnen
- `DELETE /school-items/{uuid}` – Erwachsene für jedes Profil, Kinder ausschließlich für sich selbst

Unterrichtsstunden enthalten `memberId`, `subject`, `weekday` (1–7), `startsAt`, `endsAt`, optional `room` und `teacher` sowie eine freigegebene `color`. Schuleinträge verwenden `itemType` (`HOMEWORK` oder `TEST`), `subject`, `title`, optional `description` und `dueDate`. Überfällige offene Einträge bleiben unabhängig vom gewählten Startdatum sichtbar.

### Haushalt

- `GET /household-chores` – aktiver Haushaltsplan und die zwölf jüngsten Erledigungen
- `POST /household-chores` – Admin oder Elternteil legt eine Haushaltsaufgabe an
- `PUT /household-chores/{uuid}` – Admin oder Elternteil bearbeitet und reaktiviert eine Aufgabe
- `POST /household-chores/{uuid}/complete` – Erwachsene für jede Aufgabe; Kinder nur für die eigene Zuständigkeit
- `DELETE /household-chores/{uuid}` – Admin oder Elternteil entfernt eine Aufgabe weich

Eine Aufgabe enthält `title`, optional `description`, `category` (`CLEANING`, `TRASH`, `PLANTS`, `LAUNDRY`, `PETS`, `OTHER`), `assignedMemberId`, `recurrence` (`ONCE`, `DAILY`, `WEEKLY`, `BIWEEKLY`, `MONTHLY`) und `nextDueDate`. Der Abschluss erzeugt einen unveränderlichen Historieneintrag mit planmäßigem Datum und ausführender Person. Wiederkehrende Aufgaben werden atomar weitergeschoben; bei überfälligen Aufgaben beginnt der nächste Zyklus frühestens am Abschlusstag.

### Wandmodus und Präsentation

- `GET /wall-presentation` – Gruß, Wetter, Vorschau und Fotoliste für angemeldete Profile
- `GET /wall-photos/{uuid}` – geschützte Bildauslieferung für angemeldete Profile
- `GET /admin/wall-presentation` – Präsentationseinstellungen ohne Wetterabruf; nur Admin
- `PUT /admin/wall-presentation` – Gruß und Wetterort speichern; nur Admin mit CSRF
- `POST /admin/wall-photos` – ein JPG-, PNG- oder WebP-Foto als Multipart-Feld `photo` hochladen; nur Admin mit CSRF
- `DELETE /admin/wall-photos/{uuid}` – ein Präsentationsfoto entfernen; nur Admin mit CSRF

Der Settings-Request akzeptiert `greeting`, `weatherEnabled` und `weatherLocation`. Bei aktiviertem Wetter löst der Server Ort oder Postleitzahl über Open-Meteo auf und speichert die Koordinaten. Pro Installation sind acht Fotos mit jeweils höchstens 8 MB erlaubt. Dateien liegen unter `storage/wall-photos`, sind nicht direkt öffentlich und werden ausschließlich über den authentifizierten API-Endpunkt ausgeliefert.

### Kalender

- `GET /calendars` – aktive gemeinsame und persönliche Kalender für alle angemeldeten Rollen
- `GET /calendar-events?from={iso}&to={iso}` – überlappende Termine im Zeitraum für alle angemeldeten Rollen
- `POST /calendar-events` – Admin oder Elternteil
- `PUT /calendar-events/{uuid}` – Admin oder Elternteil
- `DELETE /calendar-events/{uuid}` – Admin oder Elternteil

Lokale Termine enthalten `source: "LOCAL"` und `editable: true`. Für lokale Serien akzeptieren Create und Update `recurrenceFrequency` (`DAILY`, `WEEKLY`, `MONTHLY`, `YEARLY`), `recurrenceInterval` (1–12) und optional `recurrenceUntil` (`YYYY-MM-DD`). Ausgelieferte Vorkommen tragen eine eindeutige `id` und die zugrunde liegende `seriesId`; Mutationen verwenden die Serien-ID. Virtuelle Geburtstage enthalten `source: "BIRTHDAY"`, `editable: false`. iCal-Termine enthalten `source: "EXTERNAL"`, `editable: false`. Direkt verbundene Google-Termine enthalten `source: "GOOGLE"`; `editable` richtet sich nach der von Google gemeldeten Kalenderrolle.

### Administration: Google-Kalender

Alle Endpunkte benötigen die Rolle `ADMIN`; Mutationen benötigen zusätzlich CSRF.

- `GET /admin/calendar-sources` – eingerichtete Quellen ohne geheime URL
- `POST /admin/calendar-sources` – Google-iCal-Quelle anlegen und sofort synchronisieren
- `PUT /admin/calendar-sources/{uuid}` – Name, Farbe, Aktivstatus oder geheime URL ändern
- `POST /admin/calendar-sources/{uuid}/sync` – Synchronisation manuell auslösen
- `DELETE /admin/calendar-sources/{uuid}` – Quelle und lokalen Termin-Cache entfernen

Create akzeptiert `name`, `url`, `color` und `isActive`. Update akzeptiert dieselben Felder; fehlt `url`, bleibt die gespeicherte Adresse erhalten. Zulässig sind ausschließlich direkte HTTPS-Adressen von `calendar.google.com` im iCal-Format. Neue oder ersetzte Adressen werden vor der Persistierung abgerufen und geparst. Bei einem Fehler bleibt eine bestehende Quelle unverändert; beim Anlegen entsteht kein unbrauchbarer Eintrag. Aktive Quellen werden bei Kalenderabfragen nach 30 Minuten automatisch aktualisiert. Die Integration ist read-only.

### Administration: direkte Google-Verbindung

Alle Admin-Endpunkte benötigen Rolle `ADMIN`; Mutationen zusätzlich CSRF.

- `GET /admin/google-calendar` – Konfigurations-, Verbindungs- und Kalenderstatus ohne Geheimnisse
- `PUT /admin/google-calendar/config` – OAuth-Client-ID und Client-Secret verschlüsselt speichern
- `POST /admin/google-calendar/authorize` – kurzlebige Google-Autorisierungsadresse erzeugen
- `PUT /admin/google-calendar/sources/{uuid}` – einen Google-Kalender am Board aktivieren oder deaktivieren
- `POST /admin/google-calendar/sources/{uuid}/sync` – aktiven Google-Kalender synchronisieren
- `DELETE /admin/google-calendar` – Token widerrufen und lokalen Google-Cache entfernen
- `GET /google-calendar/oauth/callback` – öffentlicher OAuth-Callback mit serverseitiger State-Prüfung

Die Konfiguration akzeptiert `clientId` und `clientSecret`. Der Browser erhält danach nur einen gekürzten Client-ID-Hinweis, die exakt zu registrierende Callback-URL und neutrale Statusdaten. Der Callback tauscht den Autorisierungscode serverseitig gegen Token, importiert die Kalenderliste und aktiviert den primären Kalender. Schreibzugriffe auf `/calendar-events` werden anhand der Kalender-ID entweder lokal oder über die Google Calendar API ausgeführt.

`from`, `to`, `startsAt` und `endsAt` sind ISO-8601-Zeitpunkte. Schreibzugriffe akzeptieren `calendarId`, `title`, optional `description` und `location` sowie `startsAt`, `endsAt` und `allDay`. Das Ende muss nach dem Beginn liegen. Ein Abfragezeitraum ist auf 370 Tage begrenzt.

## Einmalige Einrichtung

`POST /setup` erzeugt Haushalt, Personen und Kalender. Beispiel:

```json
{
  "householdName": "Familie Beispiel",
  "locale": "de-DE",
  "timezone": "Europe/Berlin",
  "members": [
    {
      "name": "Alex",
      "role": "ADMIN",
      "color": "#345B48",
      "password": "mindestens-acht-zeichen"
    },
    {
      "name": "Kim",
      "role": "CHILD",
      "color": "#5E7FAF",
      "pin": "1234"
    }
  ]
}
```

## Regeln für neue Endpunkte

- Controller behandeln HTTP, Services Fachlogik und Repositories PDO-Zugriffe.
- Ausschließlich vorbereitete Statements verwenden.
- Öffentliche Ressourcen verwenden UUIDs statt interner SQLite-IDs.
- Rechte serverseitig erzwingen; ausgeblendete Buttons sind kein Zugriffsschutz.
- Schreibende Session-Endpunkte immer mit CSRF-Prüfung versehen.
- Keine PHP-Fehler, Secrets oder internen Pfade ausgeben.
