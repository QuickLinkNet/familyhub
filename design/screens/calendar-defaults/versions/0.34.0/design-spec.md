# Persönlicher Kalenderstandard – Designspezifikation 0.34.0

## Aufbau

1. vorhandene Kalenderansicht und Filter bleiben unverändert bedienbar
2. eine sekundäre Aktion „Als Standard speichern“ erscheint in der Filterfläche
3. die Aktion wird nur aktiv, wenn Ansicht oder Filter vom gespeicherten Profilstandard abweichen
4. im Dialog „Ansicht & Ruhezeiten“ erhält der Kalender einen eigenen Abschnitt für Tag, Woche oder Monat

## Komponenten

- erweiterte `CalendarFilters`
- erweiterte `CalendarPage`
- erweiterter `PersonalizationDialog`

## Designregeln

- temporäres Filtern verändert noch keine gespeicherten Einstellungen.
- Erfolg, Lade- und Fehlerzustand werden zusätzlich zu Farbe durch Text vermittelt.
- das Zurücksetzen der sichtbaren Filter und das Speichern des Standards bleiben getrennte Aktionen.
- die Kalenderansicht verwendet bestehende Toggle-, Button- und Theme-Komponenten.
- keine neue Abhängigkeit und keine hartcodierten Designwerte.
