# Flexible Listen – Designspezifikation 0.30.0

## Aufbau

1. bestehender `PageHeader` mit primärer Aktion „Neue Liste“
2. horizontal scrollbare Listenauswahl
3. farbige Zusammenfassung mit Titel, Sichtbarkeit, Fortschritt und Verwaltungsaktionen
4. kompakte Schnellerfassung für Punkt, Notiz und Verantwortlichkeit
5. offene Punkte vor erledigten Punkten; erledigte Punkte können gesammelt entfernt werden

## Komponenten

- `FamilyListDialog`
- `FamilyListSelector`
- `FamilyListQuickAdd`
- `FamilyListItemRow`
- `FamilyListItemDialog`
- bestehende `PageHeader`- und `EmptyStateCard`-Moleküle

## Designregeln

- Farben stammen aus der zentralen Mitgliederpalette oder aus semantischen Theme-Tokens.
- Status und Sichtbarkeit werden zusätzlich durch Text und Symbol vermittelt.
- Interaktive Ziele bleiben mindestens 48 Pixel groß.
- Die Seite funktioniert ohne horizontales Seiten-Scrolling; nur die Listenauswahl darf horizontal scrollen.
- Light-, Dark- und Nachtmodus verwenden dieselbe Komponentenstruktur.
