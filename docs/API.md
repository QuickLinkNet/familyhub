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

Create und Update akzeptieren `name`, `color`, `role`, `isActive`, optional `avatarUrl` sowie rollenabhängig `password` oder `pin`. Geheimnisse werden ausschließlich als Passwort-Hash gespeichert.

### Aufgaben

- `GET /tasks` – alle angemeldeten Rollen
- `POST /tasks` – Admin oder Elternteil
- `PUT /tasks/{uuid}` – Admin oder Elternteil
- `DELETE /tasks/{uuid}` – Admin oder Elternteil
- `POST /tasks/{uuid}/complete` – Erwachsene für jede Aufgabe; Kinder nur für die eigene zugewiesene Aufgabe

Eine prüfpflichtige Aufgabe wechselt beim Abschluss in `PENDING_VERIFICATION`.

### Kalender

- `GET /calendars` – aktive gemeinsame und persönliche Kalender für alle angemeldeten Rollen
- `GET /calendar-events?from={iso}&to={iso}` – überlappende Termine im Zeitraum für alle angemeldeten Rollen
- `POST /calendar-events` – Admin oder Elternteil
- `PUT /calendar-events/{uuid}` – Admin oder Elternteil
- `DELETE /calendar-events/{uuid}` – Admin oder Elternteil

Lokale Termine enthalten `source: "LOCAL"` und `editable: true`. Synchronisierte Google-Termine enthalten `source: "EXTERNAL"`, `editable: false` und können ausschließlich in Google Kalender geändert werden.

### Administration: Google-Kalender

Alle Endpunkte benötigen die Rolle `ADMIN`; Mutationen benötigen zusätzlich CSRF.

- `GET /admin/calendar-sources` – eingerichtete Quellen ohne geheime URL
- `POST /admin/calendar-sources` – Google-iCal-Quelle anlegen und sofort synchronisieren
- `PUT /admin/calendar-sources/{uuid}` – Name, Farbe, Aktivstatus oder geheime URL ändern
- `POST /admin/calendar-sources/{uuid}/sync` – Synchronisation manuell auslösen
- `DELETE /admin/calendar-sources/{uuid}` – Quelle und lokalen Termin-Cache entfernen

Create akzeptiert `name`, `url`, `color` und `isActive`. Update akzeptiert dieselben Felder; fehlt `url`, bleibt die gespeicherte Adresse erhalten. Zulässig sind ausschließlich direkte HTTPS-Adressen von `calendar.google.com` im iCal-Format. Neue oder ersetzte Adressen werden vor der Persistierung abgerufen und geparst. Bei einem Fehler bleibt eine bestehende Quelle unverändert; beim Anlegen entsteht kein unbrauchbarer Eintrag. Aktive Quellen werden bei Kalenderabfragen nach 30 Minuten automatisch aktualisiert. Die Integration ist read-only.

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
