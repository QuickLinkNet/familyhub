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
- Kinder können Belohnungen ausschließlich mit dem eigenen Sternenguthaben einlösen; Bonusvergabe und Katalogverwaltung bleiben Erwachsenen vorbehalten.
- Sternenguthaben werden aus einem unveränderlichen Journal berechnet; Aufgaben-IDs verhindern doppelte Gutschriften und Einlösungen werden atomar gegen den Saldo geprüft.
- Kinder können Kalender und Termine lesen; Kalenderänderungen sind Erwachsenen vorbehalten.
- Das aktuell angemeldete Profil kann sich nicht selbst löschen.
- SQL-Zugriffe verwenden vorbereitete Statements.
- Öffentliche Datensätze verwenden UUIDs.
- `storage/` ist unter Apache vor direktem HTTP-Zugriff geschützt.
- Deployment-Secrets liegen in ignorierten lokalen Umgebungsdateien.
- geheime Google-iCal-Adressen werden AES-256-GCM-verschlüsselt gespeichert; der Schlüssel liegt separat im geschützten Storage
- externe Kalenderabrufe erlauben ausschließlich validierte HTTPS-Ziele bei `calendar.google.com`, ohne Redirects und mit Größen- sowie Zeitlimits
- Kalenderquellen können ausschließlich von Admins verwaltet werden und werden nie vollständig an das Frontend zurückgegeben
- OAuth-Client-Secret, Access-Token, Refresh-Token und Google-Kalenderkennungen werden mit AES-256-GCM verschlüsselt; ein separater Schlüssel liegt im geschützten Storage
- der Google-OAuth-Callback akzeptiert ausschließlich einen zufälligen, kurzlebigen und serverseitig gehashten `state`-Wert
- die direkte Google-Verbindung fordert nur Terminzugriff und lesenden Zugriff auf die Kalenderliste an

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
- Google-OAuth-Zustimmungsbildschirm und Testnutzer bewusst verwalten; für dauerhaften Betrieb den siebentägigen Token-Ablauf des Testmodus vermeiden.
