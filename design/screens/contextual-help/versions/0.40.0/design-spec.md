# Designspezifikation

## Seitenstruktur

`/help` beginnt mit einer klaren Überschrift und einer kurzen Orientierung. Darunter stehen kompakte Themenkarten in einem responsiven Raster. Jede Karte besitzt Symbol, Titel, Kurzbeschreibung und wenige konkrete Schritte.

## Rollen

Grundlagen zu Navigation, Kalender, Aufgaben und mobiler Nutzung sind für alle Profile sichtbar. Technische Themen wie Google, Push, Ferienquellen und Backups erscheinen nur für Admins.

## Kontextlinks

Ein wiederverwendbarer Textbutton „Hilfe“ verlinkt aus komplexen Admin-Karten direkt zum passenden Seitenanker. Im App-Kopf ist die Hilfe über einen beschrifteten Icon-Button erreichbar; in der Desktop-Navigation erscheint zusätzlich „Hilfe“.

## Gestaltung

- ausschließlich bestehende MUI-Komponenten und semantische Theme-Werte
- keine neuen Farben, Schatten, Radien oder Breakpoints
- Karten bleiben auf Mobilgeräten einspaltig und auf größeren Breiten mehrspaltig
- Ankerziele erhalten beim Navigieren ausreichend Scrollabstand zum App-Kopf
- reduzierte Bewegung wird respektiert; es gibt keine Animation

## Technik

- rein statische Frontend-Inhalte, keine API und keine neue Abhängigkeit
- Lazy Loading über den bestehenden Router
- direkte Links funktionieren mit React-Router-Pfad plus Fragment
