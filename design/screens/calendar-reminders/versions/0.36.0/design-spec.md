# Individuelle Termin-Erinnerungen – Designspezifikation 0.36.0

## Aufbau

1. unter den Wiederholungsoptionen erscheint ein eigener Abschnitt „Erinnerungen“
2. kompakte Mehrfachauswahl bietet Start, 15 Minuten, 30 Minuten, 1 Stunde, 2 Stunden und 1 Tag
3. eine leere Auswahl bedeutet ausdrücklich keine FamilyHub-Erinnerung
4. der ruhige Board-Ton ist nur bei mindestens einer gewählten Erinnerung verfügbar
5. bei Google-Terminen verweist ein kurzer Hinweis auf Google Kalender

## Komponenten

- neue wiederverwendbare `EventReminderFields`
- erweiterter `EventDialog`
- vorhandene MUI-Toggle-, Checkbox- und Textkomponenten
- isolierter Wandmodus-Hook für das akustische Signal

## Designregeln

- Auswahlzustände sind durch Text und gedrückten Zustand verständlich.
- der Board-Ton respektiert persönliche Ruhezeiten und wird je Erinnerungsstufe nur einmal versucht.
- keine automatische Klangwiedergabe in Formularen oder bei der Browser-Abnahme.
- keine neue Abhängigkeit und keine hartcodierten visuellen Designwerte.
