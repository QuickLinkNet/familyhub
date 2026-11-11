# Changelog

Alle wesentlichen Änderungen werden hier dokumentiert. Das Projekt orientiert sich an [Keep a Changelog](https://keepachangelog.com/de/1.1.0/) und semantischer Versionierung.

## [Unreleased]

## [0.19.0] - 2026-11-11

### Hinzugefügt

- persönlicher Familienradar aus Kalender, Aufgaben, Eltern-Checks, Schule und Tagesroutinen
- rollenabhängige Hinweise: Kinder sehen nur eigene Pflichten, Erwachsene den relevanten Familienüberblick
- dauerhaft erreichbare Erinnerungsglocke mit Dringlichkeitszähler und direkten Sprüngen zum jeweiligen Modul
- großzügiger „Heute wichtig“-Bereich auf dem Dashboard sowie ruhige Kurzfassung im Wandmodus

### Fokus statt Benachrichtigungsflut

- nur überfällige, heute oder sehr zeitnah relevante Einträge werden aufgenommen
- Dringlichkeit, Fälligkeit und Bedeutung bestimmen die Reihenfolge; die Ausgabe ist auf zwölf Hinweise begrenzt
- Erinnerungen werden live aus vorhandenen Daten berechnet und benötigen weder Cloud-Dienst noch zusätzliche personenbezogene Speicherung

### Architektur

- zentrale Reminder-Planung mit getrenntem Orchestrierungsservice und isoliert testbarer Entscheidungslogik
- Admin-Routen aus dem API-Einstiegspunkt in ein eigenes Routenmodul verschoben; `api/index.php` liegt wieder unter 500 Zeilen

### Geprüft

- isolierter Rollen-, Sichtbarkeits- und Dringlichkeits-Smoke-Test
- Production-Build, vollständiger PHP-Lint, alle Smoke-Tests, Live-API sowie Desktop- und Mobil-Browser-QA

## [0.18.0] - 2026-11-11

### Hinzugefügt

- gemeinsame Familienziele mit Symbol, Farbe, Beschreibung, Zielgröße und optionalem Wunschtermin
- Touch-Aktion für kleine Fortschrittsschritte durch jedes angemeldete Familienmitglied
- motivierende Wochenhighlights mit Beiträgen, beteiligten Profilen und erreichten Zielen
- eigene Zielseite sowie kompakte Fortschrittskarten auf Dashboard und Wandmodus

### Rechte und Datenintegrität

- Admins und Eltern verwalten Familienziele; Kinder und Erwachsene tragen gleichermaßen Fortschritt bei
- Beiträge werden unveränderlich mit Person, Zeitpunkt und Schrittzahl protokolliert
- der letzte benötigte Beitrag wird atomar begrenzt und schließt das Ziel exakt bei 100 Prozent ab

### Geprüft

- isolierter Workflow für Anlage, Beiträge, Begrenzung, Abschluss, Validierung und Löschen
- Production-Build, vollständiger PHP-Lint, alle Smoke-Tests, Live-API sowie Desktop- und 390-Pixel-Browser-QA

## [0.17.0] - 2026-11-11

### Hinzugefügt

- Wandmodus 2.0 mit großem Zeit-/Datumsfokus, persönlichem Familiengruß und hochwertiger Präsentationsfläche
- aktuelles Wetter sowie Drei-Tage-Vorschau über Open-Meteo ohne API-Schlüssel
- bis zu acht selbst gehostete Familienfotos mit geschützter Auslieferung und automatischer 15-Sekunden-Rotation
- zentrale Adminoberfläche für Gruß, Wetterort, Foto-Upload und Fotoverwaltung

### Datenschutz und Robustheit

- Wetter wird nur bei aktivierter Option und nur anhand der gespeicherten Ortskoordinaten abgefragt
- Fotos liegen im vor direktem HTTP-Zugriff geschützten Storage und werden ausschließlich an angemeldete Profile ausgeliefert
- bei nicht erreichbarem Wetterdienst bleiben Uhrzeit, Familieninfos und Wandmodus vollständig nutzbar

### Geprüft

- isolierter Settings- und Präsentationsworkflow, Production-Build, vollständiger PHP-Lint und alle Smoke-Tests
- Desktop- und 390-Pixel-Mobilansicht, Admin-Dialog, Live-API und Browserkonsole ohne Änderung echter Familiendaten

## [0.16.0] - 2026-11-11

### Hinzugefügt

- gemeinsamer Haushaltsplan für Putzen, Müll, Pflanzen, Wäsche, Tiere und weitere Handgriffe
- einmalige, tägliche, wöchentliche, zweiwöchentliche und monatliche Wiederholungen
- klare Zuständigkeit, Fälligkeit, Überfälligkeit und Touch-Abschluss je Aufgabe
- jüngste Erledigungen mit ausführender Person sowie eigene Haushaltskarte auf dem Dashboard

### Rechte und Datenintegrität

- Admins und Eltern verwalten den Haushaltsplan; Kinder erledigen ausschließlich eigene zugewiesene Aufgaben
- jeder Abschluss wird historisch protokolliert und verschiebt eine Serie atomar auf die nächste Fälligkeit
- einmalige Aufgaben verlassen nach dem Abschluss den aktiven Plan, ohne ihre Historie zu verlieren

### Geprüft

- isolierter Workflow für Anlage, Rechte, Wiederholung, Einzelabschluss, Bearbeitung und Löschung
- Production-Build, vollständiger PHP-Lint, alle Smoke-Tests, Live-API und Browser-QA

## [0.15.2] - 2026-11-09

### Behoben

- JSON-Objektprüfung von der erst ab PHP 8.1 verfügbaren Funktion `array_is_list()` entkoppelt
- Login und alle schreibenden API-Controller bleiben damit auch bei einer abweichenden Hosting-Laufzeit kontrolliert erreichbar

### Geprüft

- eigene Listenform-Prüfung, vollständiger PHP-Lint, alle Smoke-Tests und datenfreier Live-Login-Validierungstest

## [0.15.1] - 2026-11-09

### Behoben

- Produktionsbuild standardmäßig auf den Root-Pfad einer eigenen FamilyHub-Subdomain umgestellt
- fehlerhafte JavaScript- und CSS-Auslieferung durch den bisherigen fest verdrahteten Unterpfad beseitigt
- Deployment-Beispiele und Betriebsdokumentation auf den Subdomain-Betrieb abgestimmt

### Geprüft

- Production-Build, vollständiger PHP-Lint, alle Smoke-Tests, Live-API, ausgelieferte Frontend-Assets und fehlerfreie Browserkonsole

## [0.15.0] - 2026-11-08

### Hinzugefügt

- gemeinsame Schulübersicht mit Wochenstundenplan für jedes aktive Schulkind
- farbige Unterrichtsstunden mit Fach, Uhrzeit, Raum und optionaler Lehrkraft
- Hausaufgaben und Tests mit Fach, Termin, Notiz, Personenzuordnung und Abschlussstatus
- eigene Schulkarten auf Dashboard und Wandmodus für den schnellen Familienüberblick
- isolierter Smoke-Test für Stundenplan, Kinderrechte, Abschluss, Bearbeitung und Löschung

### Rechte und Bedienung

- Admins und Eltern verwalten den strukturellen Wochenstundenplan
- Kinder dürfen eigene Hausaufgaben und Tests anlegen, bearbeiten und abhaken
- Erwachsene verwalten alle Schuleinträge; fremde Kinderprofile bleiben serverseitig geschützt
- Wochenwechsel, Personenfilter, Leer-, Lade- und Fehlerzustände sind touch- und mobilfreundlich

### Geprüft

- vollständiger Schulworkflow und Rollenprüfung in einer isolierten SQLite-Datenbank
- Desktop- und 390-Pixel-Mobilansicht, Formulare, Dashboard und Wandmodus ohne Änderung echter Familiendaten
- Production-Build, PWA, vollständiger PHP-Lint, sämtliche Smoke-Tests, Live-API und Browserkonsole

## [0.14.0] - 2026-11-07

### Hinzugefügt

- gemeinsame Familienpinnwand für kurze Hinweise und liebe Nachrichten
- frei wählbare Symbole und Farben, Wichtig-Markierung sowie optionales Ablaufdatum
- eigene Pinnwand-Karte auf dem Dashboard und ruhige Hinweise im Wandmodus
- automatische Ausblendung abgelaufener Zettel ohne Löschung der Historie
- isolierter Smoke-Test für Anlage, Erwachsenenmoderation, Kinderrechte und Löschung

### Rechte und Bedienung

- jedes angemeldete Familienmitglied darf einen Zettel anpinnen
- Kinder bearbeiten und entfernen ausschließlich ihre eigenen Hinweise
- Admins und Eltern dürfen die gesamte Pinnwand moderieren
- Leer-, Lade- und Fehlerzustände sowie Touch-Ziele sind für Desktop und Mobil ausgelegt

### Geprüft

- leere Pinnwand, Anlage- und Bearbeitungsdialog ohne Speicherung echter Familiendaten
- vollständiger Rechteablauf in einer isolierten SQLite-Datenbank
- Produktionsbuild, vollständiger PHP-Lint, sämtliche Smoke-Tests und Live-API-Health

## [0.13.0] - 2026-11-07

### Hinzugefügt

- mehrstufige Routinen mit 2 bis 12 frei sortierbaren Schritten
- eigener Tageslauf mit Fortschrittsbalken, Schrittstatus und vollständigem Abschluss
- Serienverwaltung zum Bearbeiten, Pausieren, Fortsetzen und Löschen von Routinen
- automatische, idempotente Erzeugung genau eines Tageslaufs je Vorlage und geplantem Datum
- isolierter Workflow-Smoke-Test für Anlage, 50-/100-Prozent-Fortschritt, Serienänderung und Löschung

### Rechte und Datenintegrität

- Kinder dürfen ausschließlich Schritte ihrer eigenen zugewiesenen Routine erledigen
- Vorlagenänderungen gelten für neue Tagesläufe; ein bereits begonnener Ablauf bleibt historisch stabil
- gelöschte Vorlagen werden weich gelöscht, vorhandene Tagesläufe und Schrittstände bleiben nachvollziehbar
- die vier neuen Tabellen trennen Vorlage, Vorlagenschritt, Tageslauf und Tageslaufschritt sauber voneinander

### Geprüft

- Routine- und Verwaltungsdialog auf Desktop und Mobil ohne Änderung echter Familiendaten
- vollständiger Workflow in SQLite inklusive Rollenprüfung und Fortschrittsberechnung
- Produktionsbuild, vollständiger PHP-Lint, sämtliche Smoke-Tests und Live-API-Health

## [0.12.0] - 2026-11-07

### Hinzugefügt

- ruhige Tagesansicht mit Ganztagsbereich, Zeitachse und direkter Terminanlage
- tägliche, wöchentliche, monatliche und jährliche Wiederholungen für lokale Termine samt optionalem Enddatum
- optionale Geburtsdaten in bearbeitbaren Familienprofilen und automatisch erzeugte Geburtstagsereignisse
- zentrale Design-Tokens für Farben, Radien, Schatten, Oberflächen und Touch-Ziele
- seitenweises Code-Splitting und getrennte Vendor-Bündel für einen deutlich kleineren initialen App-Download
- isolierter Kalender-Smoke-Test für Monatsendserien und Geburtstagsereignisse

### Architektur und Datenintegrität

- Serien bleiben als einzelner Datensatz gespeichert und werden nur für den abgefragten Zeitraum expandiert
- Bearbeiten und Löschen einer Wiederholung wirkt ausdrücklich auf die gesamte lokale Serie
- Geburtstage sind virtuelle, nicht versehentlich editierbare Kalenderereignisse und benötigen keine duplizierten Jahresdatensätze
- Frontend-Dateien bleiben entlang von Atomic Design und Fachgrenzen deutlich unter 500 Zeilen

### Geprüft

- Tages-, Wochen- und Monatsansicht sowie Termin- und Familienformulare auf Desktop und Mobil
- Wiederholungsformular und Geburtstagsfeld ohne Änderung echter Familiendaten
- Produktionsbuild, vollständiger PHP-Lint, sämtliche Smoke-Tests und Live-API-Health

## [0.11.0] - 2026-11-07

### Hinzugefügt

- Wochenplan mit sieben Tagen und eigenen Slots für Frühstück, Mittag- und Abendessen
- freie Gerichte sowie wiederverwendbare Lieblingsgerichte mit Symbol, Farbe und Zubereitungszeit
- strukturierte Zutaten mit Menge und passendem Einkaufsbereich
- direkte, atomare Übernahme sämtlicher Rezeptzutaten in eine gewählte Einkaufsliste
- Wochenwechsel, Heute-Rücksprung, Dashboard-Karte und eigener Mobilzugang
- isolierter Meal-Smoke-Test für Rezept, Planung, Einkaufstransfer und Löschung

### Rechte und Datenintegrität

- Wochenplan und Rezeptverwaltung bleiben serverseitig Erwachsenen vorbehalten
- eindeutige aktive Slots verhindern doppelte Mahlzeiten desselben Typs am selben Tag
- erneutes Planen ersetzt den vorhandenen Slot kontrolliert
- der Einkaufstransfer schreibt alle Zutaten gemeinsam oder bei einem Fehler keine

### Geprüft

- Produktionsbuild, vollständiger PHP-Lint und alle In-Memory-Migrationen
- Rezeptanlage, Wochenplanung, transaktionale Zutatenübernahme und Löschabläufe
- Wochenplan sowie Rezept- und Planungsdialoge auf Desktop und Mobil ohne Änderung echter Familiendaten

## [0.10.0] - 2026-11-07

### Hinzugefügt

- mehrere gemeinsame Einkaufslisten mit eigenem Namen, Symbol und Farbe
- touch-optimierte Schnell-Eingabe für Artikel, Mengen, Ladenbereiche und Dringlichkeit
- automatische Gruppierung in zehn Ladenbereiche sowie eigener „Im Wagen“-Bereich
- gemeinsames Hinzufügen, Abhaken, Wiederöffnen und Entfernen durch alle Familienprofile
- Fortschrittsanzeige, Dashboard-Karte und prominenter Mobilzugang
- isolierter Shopping-Smoke-Test für den vollständigen Listen- und Artikelablauf

### Rechte und Datenintegrität

- Listen anlegen, vollständig leeren oder löschen ist serverseitig Erwachsenen vorbehalten
- die API protokolliert Hinzufüger und abhakendes Profil
- Listenlöschung entfernt enthaltene Artikel gemeinsam in einer SQLite-Transaktion
- sämtliche Listen- und Artikeldatensätze verwenden UUIDs und vorbereitete Statements

### Geprüft

- Produktionsbuild, vollständiger PHP-Lint und alle In-Memory-Migrationen
- Listenanlage, Artikeländerung, Abhaken, Leeren und Löschen im isolierten Smoke-Test
- leere Einkaufsansicht und Listendialog auf Desktop- und Mobilbreite ohne Änderung echter Familiendaten

## [0.9.0] - 2026-11-06

### Hinzugefügt

- touch-optimierte Schatzkiste mit persönlichen Sternenguthaben, Wunschregal und Sternenbuch
- frei konfigurierbare Belohnungen mit Symbol, Farbe, Beschreibung und Sternepreis
- Aufgabensterne für einmalige und wiederkehrende Aufgaben
- Bonusvergabe durch Admins und Eltern sowie sichere Einlösung für Kinder und Erwachsene
- Dashboard-Karte und eigene Hauptnavigation für den schnellen Einstieg
- isolierter Reward-Smoke-Test für Vergabe, Einlösung und unzureichendes Guthaben

### Sicherheit und Datenintegrität

- append-only Punktejournal statt manipulierbarer Guthabenzähler
- eindeutige Aufgaben-ID verhindert doppelte Sternegutschriften
- prüfpflichtige Aufgaben vergeben Sterne erst nach Elternbestätigung
- Einlösungen werden transaktional gegen den aktuellen Saldo geprüft und können kein negatives Guthaben erzeugen
- Katalog- und Bonusverwaltung wird serverseitig auf Erwachsene beschränkt

### Geprüft

- Produktionsbuild, vollständiger PHP-Lint und In-Memory-Migrationen
- Aufgabenpunkte, Elternfreigabe, wiederkehrende Punkte und Belohnungsjournal
- Schatzkiste und Formulardialoge auf Desktop- und Mobilbreite ohne Änderung echter Familiendaten

## [0.8.0] - 2026-11-06

### Hinzugefügt

- wiederkehrende Aufgaben mit frei wählbaren Wochentagen und automatisch erzeugter nächster Ausführung
- touch-optimierte Morgen-, Nachmittags- und Abendroutinen mit eigenen Tagesgruppen
- Schnellwahl für werktägliche und tägliche Wiederholungen
- Elternbestätigung als vollständiger API- und UI-Ablauf für prüfpflichtige Aufgaben
- isolierte In-Memory-Smoke-Tests für alle Migrationen sowie den Routine- und Elternprüfungsablauf

### Geändert

- Aufgabenbereich, Dashboard und Wandmodus berücksichtigen nur aktuell fällige Aufgaben und Routinen
- abgeschlossene Aufgaben werden kompakt als jüngste Historie angezeigt
- Dashboard-Fortschritt bezieht sich auf den aktuellen Tag statt auf die gesamte Aufgabenhistorie

### Sicherheit und Datenintegrität

- die nächste Routine wird gemeinsam mit dem endgültigen Abschluss in einer SQLite-Transaktion angelegt
- eine prüfpflichtige Routine erzeugt ihre nächste Ausführung erst nach der Elternbestätigung

### Geprüft

- Routine- und Aufgabendialog auf Desktop und Mobil ohne Speicherung echter Familiendaten
- Wochentagsauswahl, Pflichtzustände, Migrationsfolge und automatische Folgeausführung

## [0.7.1] - 2026-11-06

### Geändert

- die Google-OAuth-Einrichtung führt jetzt in sechs klaren Schritten durch API-Aktivierung, Branding, Zielgruppe, Berechtigungen, Webclient und Zugangsdaten
- jeder Schritt verlinkt direkt den passenden Bereich der aktuellen Google Auth Platform
- Callback-URL und beide benötigten Google-Berechtigungen lassen sich einzeln kopieren
- Feldbeispiele, Sicherheitshinweise und der abschließende Testablauf erklären die Einrichtung ohne externe Vorkenntnisse
- der Assistent ist auf schmalen Touchscreens besser lesbar und verhindert das Speichern unvollständiger Zugangsdaten

### Geprüft

- Desktop- und Mobilansicht des Einrichtungsassistenten sowie Kopier- und Formularzustände ohne Änderung echter Google- oder Kalenderdaten

### Behoben

- Produktionsbuilds verwenden unabhängig von lokalen Entwicklungsvariablen zuverlässig die API innerhalb des konfigurierten FamilyHub-Basispfads

## [0.7.0] - 2026-11-06

### Hinzugefügt

- optionale native Google-OAuth-Verbindung ohne Service-Account oder Composer-Abhängigkeit
- geführte Einrichtung im Adminbereich mit kopierbarer Callback-URL und offiziellen Google-Einstiegen
- Auswahl der am Familienboard sichtbaren Google-Kalender samt Zugriffsstatus
- direktes Erstellen, Bearbeiten und Löschen von Terminen in beschreibbaren Google-Kalendern
- verschlüsselter Speicher für OAuth-Client-Secret, Access- und Refresh-Token mit separatem Schlüssel

### Sicherheit

- kurzlebiger, einmal verwendbarer und nur gehasht gespeicherter OAuth-State schützt den Callback vor CSRF
- minimale Google-Berechtigungen für Termine und lesenden Zugriff auf die Kalenderliste
- OAuth-Geheimnisse und externe Kalenderkennungen werden nie an das Frontend oder Repository ausgegeben

### Kompatibilität

- vorhandene iCal-Quellen bleiben unverändert als wartungsfreier read-only Weg verfügbar
- Installationen ohne Google-OAuth-Konfiguration funktionieren ohne Einschränkung weiter

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
