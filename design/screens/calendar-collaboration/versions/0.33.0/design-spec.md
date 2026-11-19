# Gemeinsame Kalendertermine – Designspezifikation 0.33.0

## Aufbau

1. bestehender Kalenderkopf und Zeitraumsteuerung
2. kompakte Filterfläche mit getrennten Zeilen für Personen und Kalender
3. bestehende Tag-, Wochen- und Monatsansicht
4. erweiterter Termindialog mit Mehrfachauswahl der Familienprofile

## Komponenten

- `CalendarFilters`
- `EventMemberRail`
- erweiterte `EventCard`
- erweiterter `EventDialog`

## Designregeln

- Profil- und Kalenderfarben kommen ausschließlich aus den vorhandenen Daten.
- Mehrere Profilfarben bilden eine gleichmäßig segmentierte Farbleiste; eine einzelne Farbe bleibt vollflächig.
- Farbe ist nie der einzige Informationsträger: Profilbilder, Namen und Filterzustände bleiben sichtbar.
- Filter sind kombinierbar, per „Alle“ beziehungsweise „Zurücksetzen“ reversibel und auf Mobilgeräten umbrechbar.
- Google- und iCal-Termine erhalten keine künstliche Profilzuordnung.
- Alle Abstände, Typografie, Oberflächen und Zustände verwenden das zentrale MUI-Theme.
