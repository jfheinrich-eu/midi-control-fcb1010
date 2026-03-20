# Change Log - 2026-03-20

## Summary
Adjusted the footswitch UI layout so FS1-FS10 labels render on a single line and both the footswitch boxes and label boxes are wider for cleaner readability.

## Files Changed
- Behringer_BehringerFCB1010UnO2.js

## What Changed
- Replaced the square footswitch size model with explicit width and height values:
  - footswitchWidth
  - footswitchHeight
- Updated footswitch button placement so wider buttons stay visually centered in each column.
- Updated lamp centering logic to follow the new wider footswitch geometry.
- Replaced the label width padding model with an explicit label width value:
  - footswitchLabelWidth
- Reduced label height for a tighter single-line layout.
- Switched footswitch label rendering from two lines to one line:
  - FS1 Rec
  - FS2 Play
  - etc.
- Kept defensive role text normalization in place.

## Why
- The user requested single-line footswitch labels.
- Wider button and label boxes improve readability and reduce the risk of clipped text.
- Explicit width and height variables are easier to tune visually than deriving widths indirectly from a square base size.

## Validation Performed
- Verified that footswitch and label geometry now use centralized width and height variables.
- Verified that label text generation now renders a single-line label format.
- Verified that lamp centering follows the updated footswitch width.
- Verified that existing MIDI bindings and transport behavior were not changed.

## UI Variables To Tune
- surface.footswitchWidth
- surface.footswitchHeight
- surface.footswitchXStep
- surface.footswitchLabelWidth
- surface.footswitchLabelHeight
- surface.footswitchLabelYOffset
- surface.footswitchRowTopY
- surface.footswitchRowBottomY
- surface.footswitchXStart
- surface.footswitchLedSize

## Risk and Follow-Up
- Final optical validation still needs to be done in Cubase MIDI Remote because rendering can vary slightly with UI scaling.
- If labels still feel cramped, increase footswitchLabelWidth first, then footswitchXStep if neighboring columns get too close.