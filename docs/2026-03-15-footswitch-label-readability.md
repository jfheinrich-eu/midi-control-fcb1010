# Change Log - 2026-03-15

> **Status: Partially outdated.**  
> This document references the config key `footswitchLabelWidthPadding`. That key was replaced by `footswitchLabelWidth` in the final layout preset design. See [2026-03-20-surface-layout-presets.md](2026-03-20-surface-layout-presets.md) for the current geometry model.

## Summary
Implemented a robust label readability hardening for footswitch labels to prevent clipped text in the Cubase MIDI Remote surface.

## Files Changed
- Behringer_BehringerFCB1010UnO2.js

## What Changed
- Increased footswitch label width by introducing a configurable width padding value.
- Centralized label geometry settings in surface configuration:
  - footswitchLabelWidthPadding
  - footswitchLabelHeight
  - footswitchLabelYOffset
- Replaced long transport role names with musician-friendly abbreviations in configuration:
  - Record -> Rec
  - Rewind -> RW
  - Forward -> FF
  - Reserved 1 -> Res1
  - Reserved 2 -> Res2
- Added defensive label-building helpers:
  - normalizeRoleLabel(roleName, maxLength)
  - makeFootswitchLabel(localConfig, roleIndex)
- Added configurable maximum role label length (maxRoleLabelLength) to prevent clipping regressions from future role name changes.
- Updated label rendering to always use the centralized and validated label text path.

## Why
- Existing footswitch labels could be clipped when role names were too long for the label field width.
- The Cubase MIDI Remote API does not provide dynamic text wrapping or font size control for label fields.
- A combination of larger label fields and controlled short role text improves readability while keeping the UI and behavior stable.

## Validation Performed
- Verified that all footswitch labels now use a single, defensive label generation path.
- Verified that label field geometry is centralized in configuration and no longer hard-coded in the rendering loop.
- Verified that missing/invalid role names fall back safely (N/A) and do not break rendering.
- Verified that MIDI bindings and transport mappings were not changed by this update.

## Risk and Follow-Up
- Visual rendering can differ slightly across Cubase versions and UI scaling factors.
- Recommended follow-up: open the script in Cubase MIDI Remote and confirm FS1-FS10 labels are fully readable with no overlap.