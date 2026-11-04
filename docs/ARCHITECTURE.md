# Architektur

Familienkompass ist in zwei unabhängig deploybare Teile aufgeteilt:

- Die React-Anwendung wird mit Vite als statische PWA gebaut.
- Die native PHP-API liegt unter `api/` und liefert JSON unter `/api/v1/`.

Das Frontend verwendet React Router für die Navigation, Material UI als zentrale Design-Basis und TanStack Query ausschließlich für Serverzustand. Wiederverwendbare visuelle Elemente gehören nach `src/components/`; fachliche Module nach `src/features/`. Der zentrale API-Client in `src/services/apiClient.ts` ist der einzige Ort für HTTP-Grundverhalten.

Die PHP-Schichten sind bewusst klein: Router → Controller → Service/Repository (mit den späteren Fachmodulen) → SQLite. Bootstrap, Fehlerbehandlung, Antworten, Migrationen, Backups und Logging sind gemeinsame Kernbausteine. Externe Anbieter werden später hinter fachlichen Adapter-Interfaces angebunden.

`storage/` liegt außerhalb der statischen Build-Ausgabe und wird zusätzlich durch Apache geschützt. Es enthält die SQLite-Datei, rotierende Backups und Logs.
