# Flexible Kalender-Wiederholungen – Designspezifikation 0.35.0

## Aufbau

1. die vorhandene Auswahl der Wiederholungsart bleibt erhalten
2. bei „Wöchentlich“ erscheint eine kompakte Auswahl Montag bis Sonntag
3. „Werktage“, „Wochenende“ und „Starttag“ setzen häufige Kombinationen
4. das vorhandene Intervall ermöglicht beispielsweise jedes zweite Wochenende
5. das Enddatum bleibt optional

## Komponenten

- erweiterter `EventDialog`
- vorhandene MUI-Toggle- und Button-Komponenten
- erweiterte Kalender-API und Serienberechnung

## Designregeln

- Wochentage sind zusätzlich zur Farbe über ihre Beschriftung erkennbar.
- Presets füllen die Auswahl, bleiben danach aber frei anpassbar.
- Google-Termine bleiben in FamilyHub schreibgeschützt und werden bei Google verwaltet.
- keine neue Abhängigkeit und keine hartcodierten Designwerte.
