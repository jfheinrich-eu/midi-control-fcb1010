# 2026-04-01 - UnO2 Setup Inline Documentation Alignment

## Date
2026-04-01

## Files changed
- UnO2_Cubase_OBS_Setup.txt

## What changed
- Updated inline header documentation to match the active setup mapping for FS5 and FS9:
  - FS5 Tap Tempo note changed in docs from `43` to `50`.
  - FS9 Click note changed in docs from `50` to `43`.
- Updated the "Suggested future Cubase note layout" block to match current setup mapping order for FS5 and FS9.
- Updated the "Documentation-only note map" block:
  - FS5 note corrected to `50`.
  - FS9 note corrected to `43`.
  - FS6/FS7 labels corrected from marker navigation wording to `Rewind` / `Forward` to match active effects.

## Why it changed
- The file had contradictory inline documentation versus active bank/effect definitions.
- This change keeps runtime behavior unchanged and only fixes documentation accuracy.

## Validation performed
- Verified `BANKS` mapping remains unchanged (`CUBASE_TAP` on FS5, `CUBASE_CLICK` on FS9).
- Verified effect definitions remain unchanged:
  - `CUBASE_CLICK` sends Note `43`.
  - `CUBASE_TAP` sends Note `50`.
- Verified only comments/documentation text was updated; no executable setup blocks were modified.
