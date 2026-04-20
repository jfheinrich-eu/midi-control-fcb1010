# Change Log - 2026-03-28

## Summary
Documented the intentional FS3 reinforced stop behavior in user-facing and architecture documentation.

## Files Changed
- README.md
- docs/ARCHITECTURE.md

## What Changed
- Added an explicit note in README under implemented behavior that FS3 intentionally uses a reinforced stop path.
- Clarified the README design goal wording to distinguish uncontrolled stop bursts from intentional reinforced stop signaling.
- Added an architecture bullet in docs/ARCHITECTURE.md stating the FS3 design intent (direct host stop binding plus debounced stop pulse).

## Why
- Review findings identified that FS3 dual-stop behavior is intentional, but the intent was not explicitly documented.
- Clear design intent prevents future contributors from removing the reinforced stop path by mistake.

## Validation Performed
- Verified README behavior section and design goals now mention the FS3 reinforced stop intent.
- Verified docs/ARCHITECTURE.md host-binding section contains the same design rationale.
- Verified all modified documentation remains in English and uses repository-relative references.
