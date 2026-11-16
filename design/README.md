# FamilyHub Design Library

This directory contains sanitized, public-safe design foundations and versioned screen specifications. Private drafts and screenshots never belong here.

## Screen lifecycle

`draft → review → approved → implemented → verified`

- Design work starts in the private sibling workspace `familyhub-private/design/work/`.
- A sanitized version may enter this repository with status `review`.
- Only the project owner may set `approved` and `approvedByUser: true`.
- Implementation requires an approved version.
- Automated checks may advance it to `implemented`.
- Explicit visual acceptance advances it to `verified`.

## Screen layout

Each screen lives in `design/screens/<screen>/` with a `manifest.json` and immutable versions under `versions/<semver>/`. A version contains `brief.md`, `design-spec.md`, `acceptance.md`, and optional public-safe assets.

`design/registry.json` is the public index. Theme foundations are documented under `design/library/`; executable tokens remain in `src/theme/`.
