# Changelog

Alle wesentlichen Änderungen werden hier dokumentiert. Das Projekt orientiert sich an [Keep a Changelog](https://keepachangelog.com/de/1.1.0/) und semantischer Versionierung.

## [Unreleased]

### Geplant

- Kalender-Terminmodell und Wochenansicht
- Aufgabenfreigabe und wiederkehrende Aufgaben

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
