---
name: familyhub-implementation
description: Implement one explicitly approved, versioned FamilyHub screen design while preserving behavior and validating the result. Use only when the user explicitly asks to implement a screen version whose public manifest is already marked approved.
---

# FamilyHub Implementation

Implement exactly one approved screen version as a reversible slice.

## Workflow

1. Read `AGENTS.md`, `design/README.md`, the named screen manifest, and its approved version files.
2. Stop if the requested version is missing, is not `approved`, or has `approvedByUser: false`.
3. Read `references/verification.md` and only the source files required by the screen.
4. Map every design value to `src/theme/`, an existing theme token, or an approved reusable component. Do not add literal colors, shadows, radii, spacing systems, or breakpoints to feature components.
5. Reuse existing MUI and Atomic Design components. Add a reusable component only when it represents repeated visual or product behavior.
6. Preserve APIs, data models, permissions, navigation, and feature behavior unless the user separately approves a functional change.
7. Keep the slice small, files preferably below 500 lines, and dependencies unchanged unless strictly necessary and approved.
8. Run the checks required by `AGENTS.md`: build, applicable lint or PHP checks, read-only Live API checks, and built-in-browser QA on desktop and mobile widths.
9. Set the public design version to `implemented` after automated checks pass. Set it to `verified` only after explicit visual acceptance by the user.
10. Document the result, then commit and push only after all release checks pass.

## Boundaries

- Never implement a draft or review-only design.
- Never write test data to the live family installation without confirmation.
- Never capture or commit private data during QA.
- Never refactor unrelated features as part of a screen implementation.
- Never silently weaken an acceptance criterion; report the blocker instead.
