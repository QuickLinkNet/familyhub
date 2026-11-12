# Langfristiges Produktziel: vollständige Dæly-Parität

Stand: 12. November 2026

FamilyHub soll die öffentlich dokumentierten Funktionen des Dæly Calendar vollständig abdecken und sie um Selbsthosting, Datenhoheit und frei kombinierbare Familienmodule erweitern. Das Ziel ist funktionale Parität; Hardware, Markenauftritt, Logo und visuelles Redesign sind eigenständige Tracks.

Referenzquellen:

- [Dæly Produktübersicht](https://daely-shop.com/)
- [Dæly Academy: Funktionen](https://claritycomputers.freshdesk.com/support/solutions/10000020368)
- [Dæly Academy: Kalenderansicht](https://claritycomputers.freshdesk.com/support/solutions/articles/10000018621-kalenderansicht)
- [Dæly Academy: externe Kalender](https://claritycomputers.freshdesk.com/support/solutions/articles/10000018630-externe-kalender-verbinden-anleitung)

## Definition von „vollständig erfüllt“

Ein Punkt zählt erst als erfüllt, wenn Frontend, API, Rechte, responsive Touch-Bedienung, Migration, Tests, Dokumentation und Live-Abnahme gemeinsam abgeschlossen sind. Eine vorhandene Navigation oder ein Platzhalter zählt nicht.

Prioritäten: **P0** Präsentations- und Alltagsreife, **P1** direkte Funktionsparität, **P2** Ausbau und Plattformkomfort.

## Kalender und Integrationen

| Ziel | Status | Priorität | Abnahmekriterium |
| --- | --- | --- | --- |
| Tag-, Wochen- und Monatsansicht | erfüllt | – | touch- und mobil nutzbar |
| 5-Tages- und Timeline-Ansicht | offen | P1 | zwischen beiden Ansichten ohne Datenverlust wechseln |
| frei wählbare Standardansicht | offen | P1 | pro Profil oder Gerät gespeichert |
| schneller Profil- und Kalenderfilter | offen | P1 | einzelne Personen und Quellen kombinierbar |
| lokale und Google-Termine erstellen, bearbeiten und löschen | erfüllt | – | CRUD live geprüft |
| Google-Zwei-Wege-Synchronisation | erfüllt | – | OAuth, Schreibrechte und Livecheck vorhanden |
| Apple/iCloud-, Outlook- und CalDAV-Anbindung | offen | P1 | mindestens ein sicherer Zwei-Wege-Adapter je Plattform |
| iCal-/URL-Kalender | erfüllt | – | verschlüsselte read-only Quellen |
| private Termine und reine Verfügbarkeitsanzeige | erfüllt | – | Kinder sehen keine vertraulichen Inhalte |
| benutzerdefinierte Wiederholung nach Wochentagen | offen | P1 | etwa werktags oder jedes zweite Wochenende |
| Mehrpersonen-Termine mit mehreren Profilfarben | offen | P1 | beliebige Familienprofile zuweisbar |
| Erinnerungszeit je Termin und optionaler Ton am Board | offen | P1 | mehrere Vorlaufzeiten und ruhige Standardwerte |
| Termin- und Kalendersuche | offen | P2 | Titel, Beschreibung, Person und Zeitraum filterbar |
| Ferien- und Feiertagsassistent | offen | P2 | Region wählen und Quelle nachvollziehbar aktivieren |

## Aufgaben, Motivation und Listen

| Ziel | Status | Priorität | Abnahmekriterium |
| --- | --- | --- | --- |
| einmalige und wiederkehrende Aufgaben | erfüllt | – | Zuweisung, Fälligkeit und Abschluss vorhanden |
| mehrstufige Morgen- und Abendroutinen | erfüllt | – | Wochentage und Tagesfortschritt vorhanden |
| optionaler Eltern-Check | erfüllt | – | serverseitig erzwungen |
| Push für fällige Aufgaben und Routinen | erfüllt | – | verschlüsselt bei geschlossener App |
| Punkte, Guthaben und frei definierbare Belohnungen | erfüllt | – | nachvollziehbares Ledger vorhanden |
| beliebige Checklisten | offen | P1 | Einkauf, Reise, Projekt und eigene Listentypen |
| versteckte Geschenk- und Überraschungslisten | offen | P1 | nur freigegebene Erwachsene sehen Inhalte |
| gemeinsame Einkaufslisten | erfüllt | – | Mengen, Kategorien und Dringlichkeit vorhanden |
| Listen- und Aufgabenvorlagen | offen | P2 | wiederverwendbar und ohne Doppelanlage |

## Essen, Schule und Haushalt

| Ziel | Status | Priorität | Abnahmekriterium |
| --- | --- | --- | --- |
| Essenswochenplan für drei Mahlzeiten | erfüllt | – | responsive Wochenplanung |
| Rezepte und Zutatenübernahme zum Einkauf | erfüllt | – | transaktionale Einkaufsübernahme |
| vollständige Rezeptbearbeitung | offen | P1 | Zubereitung, Portionen, Kategorien und Emojis |
| wiederkehrende Gerichte und Planvorlagen | offen | P2 | Zeitraum und Wochentage wählbar |
| persönlicher Stundenplan | erfüllt | – | wöchentliche Schulstunden je Kind |
| Hausaufgaben und Tests | erfüllt | – | kindgerechter Abschluss und Elternsicht |
| WebUntis-/Schulkalender-Import | offen | P2 | dokumentierter iCal- oder Adapterweg |
| eigener Haushaltsplan | erfüllt | – | Zuständigkeit, Wiederholung und Historie |
| fairer automatischer Zuständigkeitswechsel | offen | P2 | transparent und manuell korrigierbar |

## Familienerlebnis

| Ziel | Status | Priorität | Abnahmekriterium |
| --- | --- | --- | --- |
| Familienpinnwand | erfüllt | – | Priorität, Urheber und Ablaufdatum |
| gemeinsame Familienziele | erfüllt | – | Beiträge, Fortschritt und Wochenhighlights |
| persönliches Dashboard und Familienradar | erfüllt | – | rollenabhängige Inhalte |
| konfigurierbare Dashboard-Karten und Widgets | offen | P1 | Reihenfolge, Sichtbarkeit und Standardwerte je Profil |
| Foto-, Wetter- und Ruhemodus | erfüllt | – | Inaktivität, Rotation und Nachtansicht |
| installierbare mobile PWA | erfüllt | – | Desktop, Android und iOS-Homescreen dokumentiert |
| optionales App-Store-Paket | offen | P2 | erst nach stabiler PWA und Markenentscheidung |
| echte Web-Push-Erinnerungen | erfüllt | – | VAPID, Profilgeräte und Scheduler |
| individuelle Ruhezeiten je Profil | offen | P1 | Push und Board respektieren Ruhefenster |
| Rollen, Elternpasswort und Kinder-PIN | erfüllt | – | Rechte serverseitig erzwungen |
| granulare Modul- und Bearbeitungsrechte | offen | P2 | pro Rolle und Modul administrierbar |
| geführte Geräte- und PWA-Einrichtung | offen | P0 | ein nichttechnischer Haushalt kommt ohne Hilfe zum Ziel |
| integrierte kontextbezogene Hilfe | teilweise | P0 | kurze Anleitungen direkt an schwierigen Stellen |
| vollständige Barrierefreiheitsabnahme | offen | P0 | Tastatur, Screenreader, Kontrast und reduzierte Bewegung |

## Betrieb und Datenhoheit

| Ziel | Status | Priorität | Abnahmekriterium |
| --- | --- | --- | --- |
| selbst gehostete PHP-/SQLite-Installation | erfüllt | – | keine Framework- oder Composer-Laufzeitabhängigkeit |
| technische Backups und portables Komplettarchiv | erfüllt | – | Prüfsummen, Rollback und Fotos enthalten |
| automatisierte Release-Pipeline | offen | P1 | Tests, Build, Tag und reproduzierbares Paket |
| dokumentierte Updates und Migrationen | erfüllt | – | bestehende Daten bleiben erhalten |
| öffentliche Produktdokumentation | teilweise | P0 | Installation, Betrieb, Hilfe und Screenshots vollständig |
| Lizenz- und Veröffentlichungsmodell | Entscheidung offen | P0 | Eigentümer legt Lizenz oder All-rights-reserved fest |

## Empfohlene Reihenfolge

1. **P0 Produktabschluss:** Geräte-Onboarding, kontextbezogene Hilfe, Barrierefreiheit und öffentliche Dokumentation.
2. **P1 Kalenderkomfort:** Mehrpersonen-Termine, Filter, Standardansicht, Wiederholungen und individuelle Erinnerungen.
3. **P1 Alltagskomfort:** allgemeine/private Listen, vollständige Rezeptpflege, Widgets und Ruhezeiten.
4. **P1 Integrationen:** Apple/iCloud, Outlook und CalDAV.
5. **P2 Ausbau:** Ferien, Suche, Schulimport, Vorlagen, Zuständigkeitswechsel und optionales App-Paket.

Diese Liste ist das langfristige verbindliche Produktziel. Neue Produktideen werden dagegen priorisiert, aber nicht stillschweigend als erledigt markiert.
