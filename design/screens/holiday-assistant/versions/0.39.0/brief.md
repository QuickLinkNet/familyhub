# Ferien- und Feiertagsassistent – Brief 0.39.0

Familien sollen gesetzliche Feiertage und Schulferien ohne manuell gepflegten Kalenderlink direkt in FamilyHub einrichten können. Ein kurzer Assistent wählt das Bundesland, erklärt die Datenquelle und zeigt vor dem Speichern eine Vorschau.

## Ziel

- Einrichtung in wenigen verständlichen Schritten
- gesetzliche Feiertage und Schulferien getrennt aktivierbar
- automatische, zwischengespeicherte Aktualisierung
- Darstellung als nicht bearbeitbare Kalenderquellen in allen Kalenderansichten
- klarer Datenschutz- und Quellenhinweis
- ausfallsicher: vorhandene Daten bleiben bei einem Providerfehler erhalten

## Bestehendes Verhalten

- lokale, Google- und iCal-Kalender bleiben unverändert.
- bestehende Suche, Personen- und Kalenderfilter gelten weiterhin.
- Rollen und Rechte bleiben erhalten; nur Administratoren konfigurieren die Quellen.
- Ferien und Feiertage öffnen die vorhandene Termindetailansicht, bleiben aber schreibgeschützt.

## Zielgeräte

- Desktop und Wanddisplay
- Tablet im Hoch- und Querformat
- Smartphone ab 320 Pixel Breite
- Tastatur-, Maus- und Touchbedienung

## Inhalte und Zustände

- nicht eingerichtet, Vorschau, gespeichert, pausiert und wird aktualisiert
- erfolgreich aktualisiert, veraltete Daten und Providerfehler
- keine Daten im gewählten Zeitraum
- lange Feriennamen und regionale Hinweise
- kommender Feiertag sowie kommende Ferien als kompakte Vorschau

## Nicht enthalten

- schul- oder kommunalspezifische bewegliche Ferientage
- manuelle Bearbeitung importierter Ferien und Feiertage
- Urlaubsplanung oder Abwesenheitsanträge
- Länder außerhalb Deutschlands in Version 0.39.0
- Benachrichtigungen für Ferienbeginn

