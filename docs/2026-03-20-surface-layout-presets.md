# Change Log - 2026-03-20

## Summary
Added a simple surface layout preset system so the footswitch UI can switch between wide and compact geometry by changing a single configuration value.

## Files Changed
- Behringer_BehringerFCB1010UnO2.js

## What Changed
- Added a new surface configuration switch:
  - layoutPreset
- Added two layout presets inside surface.layouts:
  - wide
  - compact
- Moved footswitch geometry values into the presets:
  - footswitchWidth
  - footswitchHeight
  - footswitchXStep
  - footswitchLabelWidth
  - footswitchLabelHeight
  - footswitchLabelYOffset
- Added resolveSurfaceConfig(surfaceConfig) to merge the selected preset into the active surface configuration.
- Added a defensive fallback so an invalid preset name falls back to the wide layout.
- Updated createSurface() to use the resolved preset-based surface configuration.

## Why
- A single preset selector is easier and safer to tune than editing multiple geometry values for every iteration.
- This keeps the UI layout logic centralized and reduces the risk of inconsistent spacing changes.
- The approach is small, explicit, and easy to validate in Cubase MIDI Remote.

## Validation Performed
- Verified that the active surface config is now resolved through a single helper.
- Verified that existing footswitch rendering code still uses the same geometry keys after resolution.
- Verified that an invalid preset name does not break rendering and falls back to wide.
- Verified that MIDI mappings and transport behavior were not changed.

## How To Use
- Set surface.layoutPreset to wide for maximum readability.
- Set surface.layoutPreset to compact for a denser layout.

## Risk and Follow-Up
- Final visual tuning still needs to be checked in Cubase MIDI Remote.
- If future layouts are needed, add a new preset entry instead of scattering more direct geometry values through the file.