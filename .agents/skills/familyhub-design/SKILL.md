---
name: familyhub-design
description: Prepare, review, sanitize, and version a design handoff for one FamilyHub screen without implementing application code. Use only when the user explicitly asks to design or redesign a named FamilyHub screen, for example "Design Dashboard" or "Use $familyhub-design for the calendar".
---

# FamilyHub Design

Work on exactly one named screen. Keep design work separate from implementation.

## Workflow

1. Read `AGENTS.md`, `design/README.md`, and only the page, components, tokens, and feature files needed for the named screen.
2. Read `references/design-rules.md` before preparing the handoff.
3. Inspect the current screen in the built-in browser when available. Use an authenticated demo state without private data. If a safe screenshot is unavailable, request one instead of capturing real family data.
4. Create working material only under the private sibling workspace `familyhub-private/design/work/<screen>/<date>/`. If that workspace is unavailable, stop and ask where private drafts belong.
5. Prepare a compact external-design handoff: purpose, target devices, current problems, retained behavior, relevant tokens/components, content states, and acceptance criteria.
6. Review the returned design for theme compatibility, responsive behavior, accessibility, and reuse of existing components.
7. Copy the sanitized templates from `assets/screen-version/` to `design/screens/<screen>/versions/<semver>/`. Add only public-safe content and assets.
8. Update `design/screens/<screen>/manifest.json` and `design/registry.json` with status `review`.
9. Wait for explicit user approval. Only the user may change a version to `approved`.
10. Produce a concrete implementation handoff referencing the approved version. Do not edit application code.

## Boundaries

- Never alter feature behavior, source code, live data, or deployment state.
- Never place private screenshots, names, domains, credentials, calendars, or installation data in the repository.
- Never load the entire repository when targeted files are sufficient.
- Never approve a design on the user's behalf.
- Keep each screen independently reviewable and testable.
