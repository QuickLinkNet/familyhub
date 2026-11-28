# Ferien- und Feiertagsassistent – Designspezifikation 0.39.0

## Freigabereferenz

Der Assistent ergänzt die Administration und speist zwei verwaltete, schreibgeschützte Kalenderquellen. Es wurde kein privater Screenshot verwendet. Als Datenquelle ist die freie OpenHolidays API vorgesehen; sie dokumentiert öffentliche Quellen, fortlaufende Aktualisierung und ODbL-Lizenzierung.

- API: https://openholidaysapi.org/swagger/index.html
- Herkunft und Lizenz: https://www.openholidaysapi.org/en/faq/
- deutsche Primärquellen: https://www.openholidaysapi.org/en/sources-europe/#germany

## Platzierung und Informationsarchitektur

1. In der Administration erscheint ein Abschnitt „Ferien & Feiertage“ vor den manuellen Kalenderverbindungen.
2. Im nicht eingerichteten Zustand erklärt eine ruhige Karte Nutzen, Datenquelle und Datenschutz. Primäraktion: „Jetzt einrichten“.
3. Nach Einrichtung zeigt die Karte Bundesland, aktive Kategorien, Aktualisierungsstatus und die nächsten Einträge.
4. Aktionen sind „Jetzt aktualisieren“, „Einstellungen“ und ein expliziter Aktiv-Schalter. Entfernen liegt ausschließlich in den Einstellungen hinter einer Bestätigung.
5. Die vorhandenen Bereiche für Google und iCal bleiben fachlich und visuell getrennt.

## Assistent

### Schritt 1 – Region

- Land ist in dieser Version fest als „Deutschland“ ausgewiesen.
- „Bundesland“ ist ein verpflichtendes Auswahlfeld mit allen 16 Ländern in alphabetischer Reihenfolge.
- Ein kurzer Hinweis erklärt, dass Ferien und ein Teil der Feiertage regional geregelt sind.

### Schritt 2 – Inhalte

- Zwei eigenständige Auswahlkarten: „Gesetzliche Feiertage“ und „Schulferien“.
- Beide sind vorausgewählt; mindestens eine Kategorie muss aktiv bleiben.
- Jede Karte zeigt ihre spätere Kalenderbezeichnung und eine Vorschau der semantischen Kalenderfarbe.
- Die Farbauswahl nutzt vorhandene Theme- und Kalenderfarbmuster, keine freien Farbwerte.

### Schritt 3 – Vorschau

- Die Vorschau lädt erst nach Region und Inhaltsauswahl.
- Sie zeigt Anzahl und nächste Einträge für die kommenden zwölf Monate, ohne Daten zu speichern.
- Ferienzeiträume zeigen Start und Ende, einzelne Feiertage ein Datum.
- Ein Quellen- und Aktualitätshinweis steht direkt bei der Vorschau.
- Primäraktion: „Kalender aktivieren“; Rücksprung ändert nur den noch ungespeicherten Entwurf.

## Gespeicherter Zustand

- Feiertage und Schulferien erscheinen als getrennte Kalenderquellen, damit Familien sie unabhängig filtern können.
- Alle Einträge sind Ganztagstermine und nicht bearbeitbar.
- Ferien verwenden exklusive Endzeit korrekt, sodass der letzte Ferientag sichtbar bleibt.
- Der Kalendername enthält die Kategorie, nicht den Familiennamen, zum Beispiel „Schulferien · Hessen“.
- Bei Regionswechsel werden verwaltete Einträge atomar ersetzt; lokale und externe Termine bleiben unberührt.
- Eine pausierte Kategorie bleibt konfiguriert, wird aber weder geladen noch im Kalender angezeigt.

## Synchronisation und Datenschutz

- Der Server fragt nur Ländercode, ISO-3166-2-Region, Sprache und Datumsbereich ab; keine Familien-, Konto- oder Termindaten verlassen die Installation.
- Antworten werden serverseitig gespeichert. Eine Aktualisierung erfolgt höchstens einmal täglich sowie manuell auf Anforderung.
- Der Synchronisationsbereich deckt 90 Tage Vergangenheit und 730 Tage Zukunft ab.
- Schlägt der Abruf fehl, bleiben zuletzt erfolgreiche Einträge erhalten und die Karte zeigt eine verständliche Warnung.
- Eine erfolgreiche leere Antwort löscht Daten erst nach vollständiger Validierung.
- Die Provider-URL ist fest im Backend definiert und nicht als frei editierbares Geheimnis gespeichert.

## Technische Komponenten

- Admin-Komponenten: `HolidayAssistantCard`, `HolidayAssistantDialog`, `HolidayPreviewList`
- Feature-Hook und API-Modul unter `src/features/admin/`
- nativer PHP-Service mit kleinem Provider-Client, Service und Repository
- neue additive Migration für Einstellung und verwaltete Kalenderquellen
- Wiederverwendung von `calendar_sources` und `external_calendar_events` für Filterung und Darstellung
- Provider-Typen werden rückwärtskompatibel um eine verwaltete Ferien-/Feiertagsquelle ergänzt
- keine neue Laufzeitabhängigkeit

## Layout nach Breakpoint

- Desktop: Zusammenfassung und Aktionen in zwei Bereichen; Assistent als breiter Dialog mit Schrittanzeige.
- Tablet: flexible Zweispalten-Vorschau; Aktionen dürfen umbrechen.
- Mobil: einspaltige Karten, Vollbreitenaktionen und linearer Dialog; keine horizontale Pflichtscrollfläche.
- Wandmodus: Einträge erscheinen nur im Kalender; die Administration wird dort nicht dupliziert.

## Theme und Wiederverwendung

- vorhandene `Card`, `PageHeader`, `EmptyStateCard`, `Alert`, `Chip`, Dialog- und Formmuster
- ausschließlich semantische Theme-Farben, Kalenderfarbpalette, Abstände, Radien und Fokuszustände
- mindestens 48 Pixel große Touchziele
- keine neuen hartcodierten Farben, Schatten, Radien oder Breakpoints in Feature-Komponenten

## Barrierefreiheit

- beschriftete Schrittanzeige mit aktuellem Schritt im Text
- Auswahlkarten besitzen echten ausgewählten Zustand und sind per Tastatur bedienbar
- Status wird durch Text und Symbol statt ausschließlich durch Farbe vermittelt
- Fehlermeldungen stehen am verursachenden Schritt und werden als Live-Region angekündigt
- Vorschau verwendet echte Listen- und Zeitsemantik
- Fokus kehrt nach Schließen zur auslösenden Aktion zurück

## Lade-, Fehler- und Langzustände

- Vorschau und Aktualisierung zeigen lokale Ladeindikatoren; die restliche Administration bleibt bedienbar.
- Providerfehler bieten „Erneut versuchen“ und erklären, dass vorhandene Kalenderdaten erhalten bleiben.
- Fehlen Daten, nennt der Leerzustand Region und Zeitraum.
- Lange Namen und Hinweise umbrechen vollständig und verdecken keine Aktionen.
- Veraltete Daten werden mit Zeitpunkt und Warnstatus sichtbar, aber weiterhin angezeigt.

