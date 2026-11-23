# 5-Tage- und Timeline-Kalender – Designspezifikation 0.38.0

## Freigabereferenz

Diese Version erweitert die vorhandene Kalenderseite und verwendet ausschließlich bestehende Theme-, Karten-, Termin- und Navigationsmuster. Es wurde kein privater Screenshot verwendet.

## Ansichten

### 5 Tage

1. Die Ansicht beginnt am aktuellen Cursor und zeigt fünf aufeinanderfolgende Tage einschließlich Wochenenden.
2. Vor und zurück navigiert jeweils um fünf Tage; „Heute“ beginnt wieder mit dem aktuellen Datum.
3. Desktop und breites Tablet verwenden fünf gleichwertige Tagesspalten mit gemeinsam lesbarer Zeitordnung.
4. Auf kleinen Bildschirmen werden die fünf Tage als chronologische Tagesabschnitte untereinander dargestellt.
5. Ganztagstermine stehen vor den zeitgebundenen Terminen; leere Tage bleiben als ruhige, kompakte Fläche sichtbar.

### Timeline

1. Die Timeline zeigt einen einzelnen Tag als vertikales Stundenraster und ergänzt damit die bestehende Tagesagenda.
2. Sichtbarer Kernzeitraum ist 06:00 bis 22:00 Uhr und erweitert sich automatisch für frühere oder spätere Termine.
3. Ganztagstermine stehen in einer eigenen Zeile oberhalb des Rasters.
4. Terminblöcke zeigen mindestens Uhrzeit und Titel; verfügbare Breite ergänzt Ort und Kalender.
5. Überschneidende Termine erscheinen auf breiten Flächen nebeneinander und mobil vollständig lesbar nacheinander.
6. Am aktuellen Tag markiert eine semantische Linie die aktuelle Uhrzeit, ohne ausschließlich über Farbe zu informieren.

## Ansichtssteuerung

- Desktop und Wanddisplay zeigen Tag, Timeline, 5 Tage, Woche und Monat als zusammengehörige Auswahl.
- Mobil wird die Ansicht in einem beschrifteten Auswahlfeld angeboten, damit fünf Optionen nicht zusammengedrängt werden.
- `FIVE_DAY` und `TIMELINE` sind wie bestehende Ansichten als persönlicher Standard speicherbar.
- Die Präferenz-API und Datenbankvalidierung werden dafür rückwärtskompatibel erweitert.

## Navigation und Filter

- Timeline navigiert tageweise, 5 Tage in Fünferschritten, Woche wochenweise und Monat monatsweise.
- Suchbegriff sowie Personen- und Kalenderfilter werden vor der Darstellung angewendet.
- Das Öffnen eines Terminblocks verwendet weiterhin den bestehenden Termindialog und die vorhandenen Rechte.
- Neue Termine werden weiterhin über die vorhandenen Aktionen angelegt; leere Rasterflächen sind nicht direkt bearbeitbar.

## Theme und Komponenten

- vorhandene Theme-Farben, Abstände, Radien, Schatten und Touchziele
- erweiterte `CalendarHeader`-Ansichtssteuerung
- neue fachliche Komponenten `FiveDayCalendar` und `TimelineCalendar`
- gemeinsame kleine Zeitdarstellungsbausteine nur bei echter Wiederverwendung
- bestehende `EventCard`, Kalendernavigation und Leerzustände
- keine neue Laufzeitabhängigkeit und keine hartcodierten Farbwerte

## Barrierefreiheit

- jede Ansicht besitzt einen eindeutigen Namen und ausgewählten Zustand
- Tagesüberschriften verwenden echte Abschnittsüberschriften
- Zeitangaben und Fortsetzungen sind zusätzlich textlich erkennbar
- Terminblöcke bleiben fokussierbare Schaltflächen mit sichtbarem Theme-Fokus
- mobile Bedienelemente besitzen mindestens 48 Pixel Touchfläche
- reduzierte Bewegung benötigt keine gesonderte Animation

## Fehler-, Lade- und Langzustände

- der vorhandene Ladezustand bildet ein zur Ansicht passendes neutrales Raster
- API-Fehler bleiben oberhalb der Darstellung sichtbar
- Nulltreffer verwenden den bestehenden Kalender-Leerzustand
- dichte und überlappende Tage dürfen weder Text noch Bedienziele abschneiden
- mehrtägige Termine erhalten pro sichtbarem Tag eine verständliche Fortsetzungsanzeige
