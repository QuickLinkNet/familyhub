# Ansicht und Ruhezeiten – Designspezifikation 0.32.0

## Aufbau

1. neuer Einstieg „Ansicht & Ruhezeiten“ im bestehenden Profilmenü
2. auswählbare und über Pfeiltasten sortierbare Karten der persönlichen Übersicht
3. gleiches Muster für die Inhalte des Wandmodus
4. Ruhezeit-Schalter mit Beginn und Ende sowie verständlicher Wirkungserklärung
5. gemeinsame Speichern-Aktion für das angemeldete Profil

## Komponenten

- `PersonalizationDialog`
- `PreferenceToggleGrid`
- bestehende Dashboard- und Wandmodus-Karten
- zentrale React-Query-Hooks und serverseitiger Preferences-Service

## Designregeln

- keine neue Farbe, kein neuer Radius und kein neuer Breakpoint außerhalb des zentralen Themes
- Auswahl wird durch Checkbox, Rahmen und Text vermittelt
- Sortieraktionen besitzen eindeutige zugängliche Namen
- mindestens eine Karte bleibt je Ansicht aktiv
- Mobilansicht verwendet eine Spalte; ab Tablet zwei Spalten
- Ruhezeiten entfernen keine Hinweise, sondern pausieren ausschließlich automatische Störungen
