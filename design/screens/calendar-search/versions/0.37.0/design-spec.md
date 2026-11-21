# Kalendersuche – Designspezifikation 0.37.0

## Freigabereferenz

Diese Version beschreibt eine kompakte Erweiterung des bestehenden Kalenderfilterbereichs. Es gibt keinen privaten Screenshot; Grundlage sind die öffentliche Komponentenstruktur und das zentrale Theme.

## Aufbau

1. Oberhalb der Personen- und Kalenderchips steht ein Suchfeld mit Suchsymbol und der Beschriftung „Termine durchsuchen“.
2. Das Feld durchsucht Titel, Ort, Beschreibung, Kalendername und Namen beteiligter Profile im aktuell sichtbaren Zeitraum.
3. Ein klar beschrifteter Löschschalter erscheint bei Eingabe und setzt nur den Suchbegriff zurück.
4. Unter dem Feld nennt eine dezente Statuszeile die Trefferzahl, sobald gesucht wird.
5. Personen- und Kalenderchips wirken zusätzlich auf die Suchergebnisse.
6. „Zurücksetzen“ leert Suche und Chipfilter gemeinsam; „Als Standard speichern“ speichert weiterhin nur Ansicht und Chipfilter.

## Layout nach Breite

- Desktop/Wanddisplay: Suchfeld nutzt die verfügbare Kartenbreite; Status und Löschschalter bleiben in derselben ruhigen Informationshierarchie.
- Mobil: Suchfeld belegt die volle Breite, Bedienelemente besitzen mindestens 48 Pixel Touchfläche, Chips umbrechen wie bisher.
- Lange Inhalte: Suchtreffer verändern die vorhandenen Terminflächen nicht; Texte werden von den bestehenden Ereigniskarten behandelt.

## Theme und Komponenten

- vorhandene MUI-Varianten und Theme-Abstände
- vorhandene `CalendarFilters`-Karte
- neue wiederverwendbare Molekül-Komponente `CalendarSearchField`
- vorhandene `EmptyStateCard` für null Treffer
- keine neuen Farben, Schatten, Radien oder Breakpoints

## Interaktion

- Filterung erfolgt lokal und unmittelbar ohne Ladeanimation oder API-Aufruf.
- Groß-/Kleinschreibung und umgebende Leerzeichen beeinflussen Treffer nicht.
- Leerer Suchbegriff zeigt alle durch Chips zugelassenen Termine.
- Der Löschschalter fokussiert anschließend wieder das Suchfeld.

## Barrierefreiheit

- sichtbare Beschriftung und eindeutiger zugänglicher Name
- Ergebnisstatus mit höflicher Live-Region
- Löschschalter mit Textalternative
- vollständige Tastaturbedienung und sichtbarer Theme-Fokus
- mindestens 48 Pixel große Touchziele
