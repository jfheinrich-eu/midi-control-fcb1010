# 2026-04-20 - Review Lite Follow-ups

## Date
2026-04-20

## Files changed
- CHANGELOG.md
- .github/PULL_REQUEST_TEMPLATE.md
- CONTRIBUTING.md
- Behringer_BehringerFCB1010UnO2.js
- docs/reviews/2026-04-20-review-lite.md
- docs/reviews/2026-04-20-review.md

## What changed
- Updated `CHANGELOG.md` Unreleased section to include repository-local slash command workflow additions.
- Added a mapping consistency checklist item to `.github/PULL_REQUEST_TEMPLATE.md`.
- Added the same mapping consistency verification step to `CONTRIBUTING.md` local testing guidance.
- Replaced generic JSDoc parameter types in helper functions with the existing `SurfaceConfig` typedef and explicit `{Array<{x: number, y: number}>}` footswitch position shape.
- Moved the driver and mapping refactor changelog bullets from `0.2.0` to `Unreleased` to keep release chronology unambiguous.
- Updated `docs/reviews/2026-04-20-review-lite.md` warnings W2 and W3 to explicit at-review-time snapshot wording and follow-up references.
- Updated `docs/reviews/2026-04-20-review.md` warning W1 to explicit historical snapshot wording and removed incorrect warning W3.

## Why it changed
- Implement all actionable review follow-ups from the Review Lite report.
- Keep contributor guidance and pull request checks aligned with the existing development rule for mapping consistency.
- Ensure change visibility for prompt and workflow updates in the changelog.
- Keep type intent consistent in driver helper JSDoc so maintenance stays aligned with project typedef conventions.
- Close remaining open Copilot review threads by aligning archived report wording with current branch state.
- Preserve archived review artifacts while preventing present-tense contradictions after follow-up fixes.

## Validation performed
- Confirmed all three files contain the new mapping consistency and workflow entries.
- Verified the wording is consistent with existing project terminology.
- Confirmed all added documentation text is in English.
- Verified `createPedalLabels` and `createFootswitchOuterLabels` now use non-generic JSDoc types consistent with existing typedefs and explicit coordinate shapes.
- Verified `CHANGELOG.md` now places current PR refactor bullets under `Unreleased`.
- Verified the two 2026-04-20 stored review reports now use historical snapshot wording where required and no longer contain the incorrect W3 claim.
