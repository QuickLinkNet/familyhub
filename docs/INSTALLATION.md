# Installation und Betrieb

## 1. Voraussetzungen

Für die lokale Frontend-Entwicklung:

- Node.js 20 oder neuer
- npm 10 oder neuer
- eine erreichbare, live bereitgestellte API

Für das Hosting:

- PHP 8.2 oder neuer
- PHP-Erweiterungen `pdo_sqlite` und `mbstring`
- Apache mit `mod_rewrite`
- Schreibrechte für `storage/database`, `storage/backups` und `storage/logs`
- FTP oder FTPS für das mitgelieferte Deployment

## 2. Repository vorbereiten

```bash
npm install
copy .env.local.example .env.local
```

In `.env.local`:

```dotenv
VITE_API_BASE_URL=/api/v1
VITE_DEV_API_ORIGIN=https://example.org
VITE_DEV_API_PREFIX=/apps/familyhub
```

Der Vite-Server leitet `/api/v1` ausschließlich an diese Live-API weiter. Dadurch funktionieren sichere Sessions unter `localhost`, ohne einen lokalen PHP-Server zu starten.

## 3. Zielpfad konfigurieren

```bash
copy .env.deploy.example .env.deploy
```

Pflichtfelder:

- `FTP_HOST`, `FTP_USER`, `FTP_PASSWORD`
- `FTP_PORT` und `FTP_SECURE`
- `REMOTE_BASE_DIR=/html/apps/familyhub`
- `PUBLIC_APP_URL`

`.env.deploy` wird durch Git ignoriert. Zugangsdaten dürfen nie committed werden.

Der Standard-Basispfad des Frontends ist `/apps/familyhub/`. Andere Installationen können ihn in einer lokalen `.env.production` setzen:

```dotenv
VITE_BASE_PATH=/mein/pfad/
```

## 4. Bauen und deployen

```bash
npm run deploy
```

Dabei werden nacheinander:

1. TypeScript und Vite gebaut,
2. PWA-Dateien generiert,
3. Frontend und PHP-API in `deploy/` zusammengeführt,
4. der Remote-Pfad bei Bedarf angelegt,
5. alle Dateien per FTP/FTPS übertragen.

Der Deploy überschreibt Programmdateien, löscht aber keine vorhandene SQLite-Datenbank, Backups oder Logs.

## 5. Einmalige Einrichtung

Die erste API-Anfrage legt Storage, SQLite-Datenbank und ausstehende Migrationen an. Öffne anschließend die Anwendung. Solange kein Haushalt existiert, leitet sie automatisch nach `/setup` weiter.

Der Assistent erzeugt in einer Transaktion:

- einen Haushalt mit Sprache und Zeitzone,
- mindestens einen Admin oder ein Elternteil,
- bis zu zwölf Familienmitglieder,
- einen gemeinsamen Familienkalender,
- einen persönlichen Kalender pro Familienmitglied.

Erwachsenenpasswörter benötigen mindestens acht Zeichen. Kinder-PINs sind optional und bestehen aus vier bis acht Ziffern. Es werden ausschließlich Passwort-Hashes gespeichert.

Die Einrichtung lässt sich über die öffentliche Oberfläche nur einmal abschließen. Anschließend erscheint die Profilauswahl: Erwachsene melden sich mit ihrem Passwort an, Kinder mit ihrer optionalen PIN. Lege vorher ein Backup an, wenn du eine bestehende Installation ersetzen willst.

## 6. Betrieb prüfen

- Anwendung: `https://example.org/apps/familyhub/`
- Health: `https://example.org/apps/familyhub/api/v1/health`
- Setup-Status: `https://example.org/apps/familyhub/api/v1/setup/status`

Eine erfolgreiche Health-Antwort meldet HTTP 200 und `database: "ok"`. Geschützte Fachendpunkte antworten ohne Anmeldung mit HTTP 401. Für die Entwicklung hält der Vite-Proxy Browser und Session auf `localhost:5173`, während alle API-Aufrufe an das konfigurierte Live-System gehen.

## 7. Updates

```bash
git pull
npm install
npm run deploy
```

Neue Migrationen werden beim nächsten API-Aufruf automatisch einmalig angewendet. Vor Migrationen legt die API ein SQLite-Backup an und behält standardmäßig die letzten 14 Sicherungen.
