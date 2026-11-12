# Installation und Betrieb

## 1. Voraussetzungen

Für die lokale Frontend-Entwicklung:

- Node.js 20 oder neuer
- npm 10 oder neuer
- eine erreichbare, live bereitgestellte API

Für das Hosting:

- PHP 8.2 oder neuer
- PHP-Erweiterungen `pdo_sqlite`, `mbstring`, `fileinfo` und `zip`
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
- `REMOTE_BASE_DIR=/familyhub`
- `PUBLIC_APP_URL`

`.env.deploy` wird durch Git ignoriert. Zugangsdaten dürfen nie committed werden.

Der Standard-Basispfad des Frontends ist `/` und eignet sich für eine eigene (Sub-)Domain, deren Document Root direkt auf den FamilyHub-Ordner zeigt. Installationen in einem Unterpfad können ihn in einer lokalen `.env.production` ändern:

```dotenv
VITE_BASE_PATH=/apps/familyhub/
```

Für eine eigene Subdomain wie `https://familie.example.org/` lautet die Produktionskonfiguration entsprechend:

```dotenv
VITE_BASE_PATH=/
```

Nach aktivem DNS und SSL außerdem `PUBLIC_APP_URL=https://familie.example.org/` setzen und – falls Google OAuth genutzt wird – die im Admin-Assistenten angezeigte Callback-URL zusätzlich im Google-Projekt freigeben. SQLite und `storage/` bleiben im bestehenden FamilyHub-Ordner; es ist keine zweite Installation erforderlich.

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

- Anwendung: `https://familie.example.org/`
- Health: `https://familie.example.org/api/v1/health`
- Setup-Status: `https://familie.example.org/api/v1/setup/status`

Eine erfolgreiche Health-Antwort meldet HTTP 200 und `database: "ok"`. Geschützte Fachendpunkte antworten ohne Anmeldung mit HTTP 401. Für die Entwicklung hält der Vite-Proxy Browser und Session auf `localhost:5173`, während alle API-Aufrufe an das konfigurierte Live-System gehen.

## 7. Updates

```bash
git pull
npm install
npm run deploy
```

Neue Migrationen werden beim nächsten API-Aufruf automatisch einmalig angewendet. Vor Migrationen legt die API ein SQLite-Backup an und behält standardmäßig die letzten 14 Sicherungen.

Im Adminbereich steht das **portable Familienarchiv** für Serverumzug und Notfallkopie bereit. Die Datei mit Endung `.familyhub` enthält eine konsistente SQLite-Kopie, aktive Wandfotos und vorhandene Verbindungsschlüssel. Ein Manifest dokumentiert alle enthaltenen Dateien mit SHA-256-Prüfsummen. Da das Archiv vertrauliche Familien- und Zugangsdaten enthält, muss es wie ein wichtiges Passwort sicher aufbewahrt werden.

Beim Einspielen prüft FamilyHub Dateipfade, Größen, Prüfsummen, SQLite-Integrität und Bildtypen. Erst danach wird die Wiederherstellung für den nächsten Request vorgemerkt. Der aktuelle Datenbankstand wird automatisch gesichert; Datenbank, Fotos und Schlüssel werden gemeinsam mit Rückrollschutz aktiviert. Zur Bestätigung ist die Texteingabe `ARCHIV WIEDERHERSTELLEN` erforderlich.

Die darunterliegende **Datensicherung** bleibt als technisches Werkzeug für lokale SQLite-Schnappschüsse erhalten. Sie enthält weder Fotodateien noch Schlüssel und eignet sich deshalb nicht allein für einen Serverumzug. Für diesen Restore gilt weiterhin die Bestätigung `WIEDERHERSTELLEN`.

Browser-Benachrichtigungen werden pro Gerät und Familienprofil über die Erinnerungsglocke im Kopfbereich aktiviert. Der Browser fragt einmalig nach Erlaubnis und zeigt direkt eine Testbenachrichtigung. Ohne externen Pushdienst kann FamilyHub neue Hinweise melden, solange die Seite oder installierte PWA geöffnet ist – auch im Hintergrund. Die Einstellung lässt sich dort jederzeit wieder ausschalten.

### Automatischer Wandmodus

Über **Familienboard einrichten** im Profilmenü werden Installation und Display-Verhalten des aktuellen Geräts gemeinsam konfiguriert. Der Assistent erkennt, ob FamilyHub bereits im App-Modus läuft, bietet die native PWA-Installation an oder zeigt eine zum Browser passende manuelle Anleitung.

Nach der gewählten Ruhezeit kann FamilyHub selbstständig zur Familienanzeige wechseln. Ein großer Button führt mit einem Tipp zurück an die zuvor geöffnete Stelle. Unterstützte Browser können den Bildschirm im Wandmodus über die Screen Wake Lock API eingeschaltet halten. Wird diese Freigabe blockiert oder nach einem Tabwechsel beendet, zeigt der Wandmodus den tatsächlichen Zustand und bietet eine erneute bewusste Aktivierung an.

Die gesamte Konfiguration wird nur in diesem Browser gespeichert und ist deshalb besonders für ein festes Küchen- oder Flurdisplay geeignet. Offene Dialoge und aktive Eingaben unterbrechen die Automatik; den Browser-Vollbildmodus muss eine Person aus Sicherheitsgründen einmal bewusst antippen. Systemeinstellungen für Helligkeit und Energieverwaltung können Browserfunktionen weiterhin überstimmen.

Optional kann im selben Assistenten eine tägliche Betriebszeit festgelegt werden. Außerhalb dieses Fensters reduziert FamilyHub die Anzeige auf eine dunkle Uhr, gibt den Screen Wake Lock frei und schont damit Display und Stromverbrauch. Zum Beginn der Betriebszeit kehrt das geöffnete Board automatisch zur Tagesansicht zurück. Bei Bedarf lässt sich die Tagesansicht nachts für 30 Minuten einblenden; der gespeicherte Zeitplan bleibt dabei unverändert. Eine installierte PWA oder Browserseite muss für automatische Übergänge geöffnet bleiben.

## 8. Optional: Google-Termine direkt bearbeiten

Der iCal-Link benötigt keine weitere Infrastruktur und bleibt die empfohlene read-only Grundeinstellung. Für Erstellen, Bearbeiten und Löschen direkt in FamilyHub öffnet ein Admin unter `/admin` den Assistenten „Google direkt verbinden“.

Einmalig erforderlich; der Assistent verlinkt jeden genannten Google-Bereich direkt und stellt alle längeren Werte kopierbar bereit:

1. in der Google Cloud Console ein Projekt auswählen oder erstellen,
2. die Google Calendar API aktivieren,
3. unter „Google Auth Platform → Branding“ App-Name und Supportkontakt eintragen,
4. unter „Zielgruppe“ bei privaten Google-Konten „Extern“ wählen und im Testmodus die Familienkonten als Testnutzer eintragen,
5. unter „Data Access“ die im Assistenten angezeigten beiden Kalenderberechtigungen hinzufügen,
6. eine OAuth-Client-ID vom Typ „Webanwendung“ erstellen,
7. die im FamilyHub-Assistenten angezeigte Callback-URL exakt als autorisierte Weiterleitungs-URI eintragen,
8. Client-ID und Secret in FamilyHub speichern und „Mit Google anmelden“ wählen.

Im Google-Testmodus können Refresh-Tokens nach sieben Tagen ablaufen. Für dauerhaften Betrieb den Zustimmungsbildschirm in den Produktionsstatus versetzen und Googles Hinweise für sensible Kalenderberechtigungen beachten. Self-Hoster verwenden ihren eigenen OAuth-Client; das Repository enthält keine Betreiber-Secrets. Optional kann der Webserver die kanonische Anwendungsadresse über `FAMILYHUB_PUBLIC_URL=https://example.org/apps/familyhub` vorgeben. Ohne Variable erkennt FamilyHub sie aus der HTTPS-Anfrage.
