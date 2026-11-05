# Changelog

Alle wesentlichen Änderungen werden hier dokumentiert. Das Projekt orientiert sich an [Keep a Changelog](https://keepachangelog.com/de/1.1.0/) und semantischer Versionierung.

## [Unreleased]

### Geplant

- Aufgabenfreigabe und wiederkehrende Aufgaben
- Routinen für Morgen und Abend

## [0.5.1] - 2026-11-05

### Geändert

- Frontend konsequent in gemeinsame Atome, Moleküle und Organismen sowie fachlich gekapselte Komponenten gegliedert
- App-Shell, Dashboard, Kalender, Aufgaben, Familie, Anmeldung und Einrichtung in kleine Komponenten mit klarer Verantwortung zerlegt
- wiederkehrende Seitenköpfe, Leerzustände und Familienavatare zentral wiederverwendbar gemacht
- größte Frontenddatei von 280 auf rund 110 Zeilen reduziert; alle TypeScript-Dateien bleiben deutlich unter 500 Zeilen

### Geprüft

- TypeScript-Kompilierung nach jeder Refactoring-Etappe
- unveränderte Rollenrechte und Formulardialoge ohne Schreibzugriff auf Familiendaten

## [0.5.0] - 2026-11-05

### Hinzugefügt

- umschaltbare Wochen- und Monatsansicht im Familienkalender
- vollständiges Monatsraster mit Kalenderfarben und kompakten Terminübersichten auf Desktopbreite
- touchoptimierte Monatsauswahl mit Tagesagenda auf Smartphone und Tablet

### Geprüft

- Monatswechsel, Tagesauswahl, Heute-Rücksprung und Rückwechsel zur Wochenansicht
- Desktop- und Mobilbreite sowie schreibgeschützte Kinderansicht

## [0.4.1] - 2026-11-05

### Behoben

- vollständige Familiennamen bleiben auf schmalen Mobilansichten lesbar
- unbekannte URLs zeigen eine klare Nicht-gefunden-Seite statt eines Modul-Platzhalters

### Geprüft

- Desktop- und Mobilansichten für Dashboard, Familie, Aufgaben und Kalender
- Kalender-Wochenwechsel sowie getrennte Admin- und Kinderrechte

## [0.4.0] - 2026-11-04

### Hinzugefügt

- Kalendertermine mit Beschreibung, Ort, Uhrzeit und Ganztagsoption
- responsive Wochenansicht für gemeinsamen und persönliche Kalender
- Terminverwaltung für Admins und Eltern; schreibgeschützte Kinderansicht
- echte Kalender-, Aufgaben- und Familiendaten auf dem Dashboard
- persönlicher Kalender für nachträglich angelegte Familienmitglieder

### Geändert

- Dashboard-Platzhalter für spätere Module sind klar als Roadmap gekennzeichnet
- Kalender- und Dashboard-Abfragen verwenden ausschließlich die Live-API

## [0.3.0] - 2026-11-04

### Hinzugefügt

- Touch-Anmeldung über Familienprofile
- sichere PHP-Sessions mit HttpOnly-Cookie und CSRF-Schutz
- Login-Sperre nach wiederholten Fehlversuchen
- Login-, Logout-, Profil- und Session-Endpunkte
- rollenbasierte API-Rechte für Familie und Aufgaben
- Profilanzeige und Logout in der App-Shell

### Geändert

- Familienprofile unterstützen sichere Erwachsenenpasswörter und optionale Kinder-PINs
- Kinder können nur eigene zugewiesene Aufgaben abschließen
- lokale Frontend-Entwicklung verwendet Cookie-Sessions ausschließlich mit der Live-API
- fehlerhafte UTF-8-Texte in berührten Oberflächen und Services bereinigt

## [0.2.0] - 2026-11-04

### Hinzugefügt

- einmaliger Einrichtungsassistent für Haushalt und bis zu zwölf Personen
- Admin-/Elternpasswörter und optionale Kinder-PINs als sichere Hashes
- gemeinsamer Familienkalender und persönlicher Kalender pro Person
- Setup-Status- und Installationsendpunkte
- Setup-Gate und Hosting-taugliches Router-Basename
- Installations-, Sicherheits- und Beitragsdokumentation

### Geändert

- Dokumentation vollständig UTF-8-bereinigt
- Roadmap auf den Vergleich mit digitalen Familienkalendern ausgerichtet

## [0.1.0] - 2026-11-04

### Hinzugefügt

- React-/Vite-/Material-UI-PWA mit responsiver App-Shell
- native PHP-/SQLite-API mit Migrationen, Backups, Logging und Health
- Familienmitglieder und Aufgaben als erste End-to-End-Slices
- FTP-Deployment mit geschütztem Storage
