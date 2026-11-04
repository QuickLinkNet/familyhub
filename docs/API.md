# API

Basis: `/api/v1`. Antworten sind JSON und verwenden immer dieselbe Hülle.

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

## Health

`GET /api/v1/health`

Liefert Status, Datenbankzustand und Anwendungsversion.

## Einmalige Einrichtung

`GET /api/v1/setup/status`

Liefert `required`, `completed` und `version`. Familien- oder Kalenderdaten werden über diesen öffentlichen Statusendpunkt nicht ausgegeben.

`POST /api/v1/setup`

Beispiel:

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

Rollen: `ADMIN`, `PARENT`, `CHILD`. Die Installation erzeugt Haushalt, Personen und Kalender transaktional. Nach Abschluss antwortet ein weiterer Versuch mit HTTP 409 und `SETUP_ALREADY_COMPLETED`.

## Familienmitglieder

- `GET /api/v1/family-members`
- `POST /api/v1/family-members`
- `PUT /api/v1/family-members/{uuid}`
- `DELETE /api/v1/family-members/{uuid}`

Create und Update akzeptieren `name`, `color`, `role`, `isActive`, optional `avatarUrl` und optional `pin`. PINs werden als Passwort-Hash gespeichert. Delete ist ein Soft-Delete.

## Aufgaben

- `GET /api/v1/tasks`
- `POST /api/v1/tasks`
- `PUT /api/v1/tasks/{uuid}`
- `POST /api/v1/tasks/{uuid}/complete`
- `DELETE /api/v1/tasks/{uuid}`

Aufgaben unterstützen Titel, Beschreibung, Zuweisung, Datum, Priorität und optionale Elternprüfung. Eine prüfpflichtige Aufgabe wechselt beim Abschluss in `PENDING_VERIFICATION`.

## Regeln für neue Endpunkte

- Controller behandeln HTTP, Services die Fachlogik und Repositories PDO-Zugriffe.
- Ausschließlich vorbereitete Statements verwenden.
- Öffentliche Ressourcen verwenden UUIDs statt interner SQLite-IDs.
- Validierung und Autorisierung passieren serverseitig.
- Keine PHP-Fehler, Secrets oder internen Pfade in Antworten ausgeben.
