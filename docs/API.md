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
