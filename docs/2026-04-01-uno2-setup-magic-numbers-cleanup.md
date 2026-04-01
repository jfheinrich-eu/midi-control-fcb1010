# 2026-04-01 - UnO2 Setup Magic Numbers Cleanup

## Date
2026-04-01

## Files changed
- UnO2_Cubase_OBS_Setup.txt

## What changed
- Replaced inline numeric note and velocity literals in effect blocks with named constants.
- Added a dedicated constants section in `GLOBALS` for:
  - Note-on and note-off velocity values.
  - Footswitch note assignments (`FS1`..`FS10`).
- Updated documentation-only note map to reference the new constants instead of literal numbers.

## Why it changed
- Eliminates magic numbers from behavior-relevant setup logic.
- Makes note assignments and velocity semantics explicit and easier to maintain safely.
- Reduces risk of inconsistent updates when remapping notes in future.

## Validation performed
- Verified all `EFFECT_ON` and `EFFECT_OFF` blocks now reference note constants and velocity constants.
- Verified note meanings remain unchanged:
  - FS1=36, FS2=38, FS3=40, FS4=41, FS5=50, FS6=45, FS7=47, FS8=48, FS9=43.
- Verified only naming/refactoring changes were made; bank/effect structure remains unchanged.
