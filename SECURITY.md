# Sicherheit

## Sicherheitsmeldungen

Bitte Sicherheitslücken nicht als öffentliches Issue veröffentlichen. Nutze einen privaten Security Advisory im GitHub-Repository oder kontaktiere den Repository-Eigentümer direkt. Nenne betroffene Version, reproduzierbare Schritte und mögliche Auswirkungen.

## Sicherheitsmodell ab Version 0.4.0

- Session-ID ausschließlich als `HttpOnly`-, `Secure`- und `SameSite=None`-Cookie auf HTTPS.
- Zufälliger CSRF-Token für Logout und sämtliche geschützten Mutationen.
- Rollenrechte werden in der PHP-API erzwungen.
- Admins und Eltern verwenden Passwort-Hashes; Kinder optional PIN-Hashes.
- Fünf falsche Loginversuche sperren Client und Profil für fünf Minuten.
- Kinder können ausschließlich eigene zugewiesene Aufgaben abschließen.
- Kinder können Kalender und Termine lesen; Kalenderänderungen sind Erwachsenen vorbehalten.
- Das aktuell angemeldete Profil kann sich nicht selbst löschen.
- SQL-Zugriffe verwenden vorbereitete Statements.
- Öffentliche Datensätze verwenden UUIDs.
- `storage/` ist unter Apache vor direktem HTTP-Zugriff geschützt.
- Deployment-Secrets liegen in ignorierten lokalen Umgebungsdateien.

Die öffentliche Profilauswahl liefert Namen, Farbe, Rolle und die Information, ob ein Geheimnis erforderlich ist. Das ist für ein gemeinsames Familien-Touchdisplay beabsichtigt. Öffentlich aus dem Internet erreichbare Installationen sollten zusätzlich durch Firewall, VPN oder Webserver-Zugriffsschutz begrenzt werden.

## Lokale Entwicklung

Der lokale Vite-Server proxyt `/api/v1` zur konfigurierten Live-API. Dadurch bleiben Browser-Session und CSRF-Token same-origin auf `localhost`, während kein lokales Backend gestartet wird. Der CSRF-Header schützt weiterhin alle schreibenden Session-Anfragen.

## Betreiberpflichten

- HTTPS erzwingen.
- FTP nach Möglichkeit durch FTPS ersetzen.
- `.env.deploy`, SQLite-Dateien, Backups und Logs niemals veröffentlichen.
- PHP-Fehleranzeige in Produktion deaktivieren.
- Schreibrechte auf `storage/` beschränken.
- Backups regelmäßig außerhalb des Webroots sichern und Restore testen.
- Updates zeitnah einspielen.
