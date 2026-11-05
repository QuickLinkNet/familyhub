# Changelog

Alle wesentlichen Änderungen werden hier dokumentiert. Das Projekt orientiert sich an [Keep a Changelog](https://keepachangelog.com/de/1.1.0/) und semantischer Versionierung.

## [Unreleased]

### Geplant

- Aufgabenfreigabe und wiederkehrende Aufgaben
- Routinen für Morgen und Abend

## [0.6.1] - 2026-11-05

### Geändert

- neue und geänderte Google-iCal-Adressen werden vollständig geprüft, bevor FamilyHub sie speichert
- der Verbindungsdialog verlinkt die offizielle Google-Anleitung und warnt direkt vor öffentlichen statt geheimen iCal-Adressen
- die Linkeingabe löst keinen Passwortmanager mehr aus
- der Wandmodus zeigt bei zeitgebundenen Terminen Start- und Endzeit
- neutrale Kalendertexte ersetzen personenbezogene Beispieltexte und eignen sich damit für allgemeine Self-Hosting-Installationen
- lesende API-Aufrufe überbrücken kurze Netzwerk- und Hosting-Aussetzer mit begrenzten Wiederholungen

### Behoben

- ein ungültiger Ersatzlink kann eine funktionierende Kalenderquelle nicht mehr überschreiben
- Google-Ablehnungen, Zeitüberschreitungen und öffentliche Links liefern unterscheidbare Hilfetexte

### Geprüft

- bestehender Google-Kalender mit echten Terminen in Wochenkalender, Adminbereich und Wandmodus
- Dialogzustände für geheime und öffentliche iCal-Adressen ohne Speicherung von Testdaten

## [0.6.0] - 2026-11-05

### Hinzugefügt

- geschützter Adminbereich für externe Kalenderquellen
- read-only Google-Kalender über die geheime iCal-Adresse mit manueller und automatischer Synchronisation
- AES-256-GCM-verschlüsselte Linkablage mit separatem Schlüssel im geschützten Storage
- nativer iCal-Parser für Termine, Ganztagstermine, Ausnahmen und gängige Wiederholungen
- eigenständiger responsiver Wandmodus mit Uhr, nächsten Terminen, offenen Aufgaben und Familienprofilen
- direkte Einstiege für Wandmodus und Google-Kalender auf dem Dashboard

### Geändert

- unfertige Module werden in der normalen Präsentationsoberfläche nicht mehr als Hauptnavigation beworben
- externe Termine werden klar als read-only behandelt und bleiben ausschließlich in Google bearbeitbar

### Sicherheit

- Google-Feeds sind auf direkte HTTPS-iCal-Ziele bei `calendar.google.com` begrenzt
- DNS-Ziele, Redirects, Downloadgröße und Zeitlimits werden serverseitig kontrolliert

### Geprüft

- iCal-Parser-Smoke-Test und wiederholbarer Migrationslauf
- Admin-, Rollen-, Kalender- und Wandmodus-Regression auf Desktop und Mobil

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
