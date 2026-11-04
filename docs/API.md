# API

Basis: `/api/v1`  
Antworten sind immer JSON.

## Health

`GET /api/v1/health`

```json
{
  "success": true,
  "data": { "status": "ok", "database": "ok", "version": "0.1.0" }
}
```

Fehler verwenden dieselbe HÃƒÂ¼lle mit `success: false` und einem `error`-Objekt aus maschinenlesbarem `code` und sicherer `message`.

## Regeln fÃƒÂ¼r neue Endpunkte

- Controller behandeln HTTP, Services Fachlogik und Repositories PDO-Zugriffe.
- Verwende ausschlieÃƒÅ¸lich vorbereitete Statements.
- Ãƒâ€“ffentliche Ressourcen verwenden UUIDs statt interner SQLite-IDs.
- Autorisierung und Validierung passieren serverseitig.
- Keine PHP-Fehler oder interne Pfade in API-Antworten ausgeben.

## Family members

- `GET /api/v1/family-members` lists active and inactive, non-deleted members.
- `POST /api/v1/family-members` creates a member and returns `201`.
- `PUT /api/v1/family-members/{uuid}` updates a member.
- `DELETE /api/v1/family-members/{uuid}` soft-deletes a member and returns `204`.

Create and update accept `name`, `color`, `role`, `isActive`, an optional `avatarUrl`, and an optional `pin`. PINs are validated as 4â€“8 digits and stored only as password hashes.
## Tasks

- `GET /api/v1/tasks` lists current tasks, including the optional assigned family member.
- `POST /api/v1/tasks` creates a task and returns `201`.
- `PUT /api/v1/tasks/{uuid}` updates task details.
- `POST /api/v1/tasks/{uuid}/complete` completes a task; tasks requiring approval become `PENDING_VERIFICATION`.
- `DELETE /api/v1/tasks/{uuid}` soft-deletes a task and returns `204`.

Tasks accept `title`, optional `description`, optional `assignedMemberId`, optional `dueDate` (`YYYY-MM-DD`), `priority` (`LOW`, `MEDIUM`, or `HIGH`), and `requiresVerification`.