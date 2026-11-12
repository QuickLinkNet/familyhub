# Familienkompass

Familienkompass ist ein touch-optimierter, selbst hostbarer Familienorganizer. Die React-PWA bündelt Termine, Aufgaben und Personen in einer ruhigen Oberfläche; eine schlanke PHP-/SQLite-API hält Installation und Betrieb bewusst einfach.

## Aktueller Stand

- responsive PWA für Wanddisplay, Tablet und Mobilgerät
- gemeinsamer und persönlicher Familienkalender mit Tag, Woche, Monat, lokalen Wiederholungen, Geburtstagen, Terminverwaltung und privater Kindersicht
- Google-Kalender wahlweise wartungsfrei read-only per iCal oder mit direktem OAuth-Schreibzugriff
- konfigurierbarer Wandmodus 2.0 mit Uhrzeit, Wetter, Familienfotos, Terminen, Aufgaben und Schule sowie Geräte-Assistent, Leerlauf-Wechsel, Bildschirm-Wachhalten und gedimmter Nachtansicht
- geschützter Adminbereich für Präsentation, Kalenderquellen und Synchronisationsstatus
- bearbeitbare Familienmitglieder mit Rollen, Farben, optionalem Geburtstag, sicherem Elternpasswort und optionalem Kinder-PIN
- Touch-Anmeldung mit HttpOnly-Session, CSRF-Schutz und serverseitigen Rollenrechten
- Aufgaben sowie mehrstufige Morgen-/Abendroutinen mit Wochentagen, Fortschritt, automatischen Tagesläufen und Serienverwaltung
- motivierende Schatzkiste mit Aufgabensternen, persönlichen Guthaben, Wunschregal, Bonusvergabe und transparentem Sternenbuch
- gemeinsame Familienziele mit Fortschritt, Wochenhighlights und Beiträgen aller Profile
- persönlicher Familienradar mit rollenabhängigen In-App- und verschlüsselten Web-Push-Erinnerungen für Termine, Aufgaben, Schule und Routinen
- gemeinsame Einkaufslisten mit Mengen, Ladenbereichen, Dringlichkeit, Fortschritt und schnellem Touch-Abhaken
- Essenswochenplan für Frühstück, Mittag und Abend mit Lieblingsgerichten und direkter Zutatenübernahme zum Einkauf
- gemeinsame Familienpinnwand mit wichtigen Hinweisen, persönlicher Urheberschaft und automatischem Ablaufdatum
- Schulübersicht mit persönlichem Wochenstundenplan, Hausaufgaben, Tests und kindgerechtem Abhaken
- gemeinsamer Haushaltsplan mit Zuständigkeiten, Wiederholungen, Fälligkeiten und nachvollziehbaren Erledigungen
- einmaliger Einrichtungsassistent für Haushalt, Personen und persönliche Kalender
- selbstinitialisierende PHP-/SQLite-API mit Migrationen, lokalen Backups, portablem Komplettarchiv, Logs und Health-Check
- reproduzierbarer FTP-Deploy per `npm run deploy`

Die vollständige Produkt-Roadmap steht in [docs/FEATURES.md](docs/FEATURES.md).

## Schnellstart für die Entwicklung

Voraussetzungen: Node.js 20+ und eine bereits bereitgestellte Live-API.

```bash
npm install
copy .env.local.example .env.local
npm run dev
```

Trage in `.env.local` die URL deiner Live-API ein. Der Entwicklungsserver läuft standardmäßig unter [http://localhost:5173](http://localhost:5173). In diesem Projekt wird bewusst kein lokaler PHP-Server verwendet.

## Deployment

```bash
copy .env.deploy.example .env.deploy
npm run deploy
```

Der Befehl prüft TypeScript, baut die PWA, erstellt `deploy/` und lädt Frontend sowie API per FTP hoch. Bestehende Laufzeitdaten unter `storage/` werden nicht gelöscht. Zugangsdaten bleiben in der ignorierten Datei `.env.deploy`.

Der Produktionsbuild ist standardmäßig für eine eigene (Sub-)Domain konfiguriert, deren Document Root direkt auf den FamilyHub-Ordner zeigt. Für eine Installation in einem Unterpfad wird `VITE_BASE_PATH` in einer lokalen `.env.production` angepasst.

Nach dem ersten Deployment führt `/setup` durch Haushalt, Familienmitglieder und Kalender. Danach melden sich Erwachsene mit Passwort und Kinder mit ihrer optionalen PIN über die Profilauswahl an. Die Installation ist transaktional und kann nur einmal abgeschlossen werden.

Admins können unter `/admin` Google Kalender auf zwei Arten verbinden:

- Die **Geheime Adresse im iCal-Format** ist der einfache read-only Weg. FamilyHub prüft sie vor dem Speichern, legt sie verschlüsselt ab und überträgt sie nie wieder vollständig an das Frontend.
- Die optionale OAuth-Verbindung erlaubt, Google-Termine direkt am Familienboard zu erstellen, zu bearbeiten und zu löschen. Ein integrierter Schritt-für-Schritt-Assistent verlinkt jeden benötigten Bereich der Google Auth Platform, bietet Callback-URL und Berechtigungen kopierbar an und erklärt die erwarteten Zugangsdaten. Client-Secret, Refresh- und Access-Token werden verschlüsselt gespeichert; im Git-Repository liegen keinerlei Zugangsdaten.

Ausführlich: [Installation](docs/INSTALLATION.md), [Architektur](docs/ARCHITECTURE.md), [API](docs/API.md), [Datenbank](docs/DATABASE.md), [Sicherheit](SECURITY.md).

## Projektstruktur

- `src/app` – Router, Theme und App-Shell
- `src/components/atoms` – kleinste wiederverwendbare UI-Grundbausteine
- `src/components/molecules` – zusammengesetzte, fachlich neutrale UI-Muster
- `src/components/organisms` – größere wiederverwendbare Bereiche wie Navigation und App-Header
- `src/features` – fachliche Frontend-Module mit eigenen Komponenten, Hooks, Seiten und Typen
- `src/services` – zentraler API-Client
- `api/` – native PHP-API
- `storage/` – geschützte Laufzeitdaten
- `scripts/` – Build- und FTP-Deployment
- `docs/` – Produkt- und Technikdokumentation

Seiten bleiben reine Orchestratoren für Daten, Zustand und fachliche Komponenten. Neue Frontenddateien sollen eine klar abgegrenzte Verantwortung besitzen und möglichst deutlich unter 500 Zeilen bleiben.

## Mitwirken

Bitte [CONTRIBUTING.md](CONTRIBUTING.md) lesen. Sicherheitsprobleme gehören nicht in öffentliche Issues; Hinweise stehen in [SECURITY.md](SECURITY.md).

> Hinweis: Für das Repository ist noch keine Open-Source-Lizenz festgelegt. Kopieren, Weitergabe und kommerzielle Nutzung sind deshalb erst nach ausdrücklicher Freigabe erlaubt.
