# 2026-04-01 - Magic Numbers Cleanup and Inline Documentation

## Date
2026-04-01

## Files changed
- Behringer_BehringerFCB1010UnO2.js

## What changed
- Replaced non-obvious numeric literals in behavior-critical logic with named constants:
  - Value-state constants (`off`, `on`, `pressThreshold`, `max`)
  - Footswitch grid constants (`columnCount`, ordered row property names)
  - Footswitch role indices (`record`, `play`, `stop`, `cycle`, `tap`, `rewind`, `forward`, `undo`, `metronome`)
  - MIDI channel and tap tempo conversion constants
  - UI micro-layout offsets for TAP and pedal labels
- Replaced inline MIDI note array with row-based constants (`bottom`, `top`) and explicit concatenation preserving index order.
- Refactored `makeFootswitchPositions()` from repeated literal entries to loop-based grid generation.
- Added inline comment in `makeFootswitchPositions()` to explain why `footswitchXStep` is multiplied by column index and why order is important.
- Replaced repeated numeric thresholds and index literals in bindings and lamp updates with named constants.

## Why it changed
- Improve maintainability and readability by removing magic numbers from control-flow and mapping code.
- Make implicit contracts explicit:
  - Footswitch index to UI order contract (bottom row first, then top row)
  - Footswitch index to MIDI note mapping stability
  - Press/release threshold behavior consistency
- Reduce risk of accidental regressions when adjusting layout or transport bindings in future edits.

## Validation performed
- VS Code diagnostics check on `Behringer_BehringerFCB1010UnO2.js`: no errors.
- Manual verification of note mapping order:
  - `FOOTSWITCH_NOTES_BY_ROW.bottom.concat(FOOTSWITCH_NOTES_BY_ROW.top)` still resolves to
    `[36, 38, 40, 41, 50, 45, 47, 48, 43, 52]`.
- Manual verification of position generation semantics:
  - `makeFootswitchPositions()` still generates 10 positions in identical order semantics:
    indices `0..4` bottom row, `5..9` top row.
- Transport behavior paths kept unchanged (record/play/stop flow and stop-pulse debounce logic).
