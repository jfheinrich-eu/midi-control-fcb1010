# Change Log - 2026-03-20

## Summary
Switched to single-file dual device registration so both wide and compact variants are reliably visible from one script in Cubase.

## Files Changed
- Behringer_BehringerFCB1010UnO2.js
- README.md
- Removed: Behringer_BehringerFCB1010UnO2_Compact.js

## What Changed
- Replaced single-driver bootstrap with reusable registration functions:
  - cloneConfig(localConfig)
  - makeVariantConfig(baseConfig, deviceName, layoutPreset)
  - registerDevice(localConfig)
- Registered two devices from the same script file:
  - BehringerFCB1010UnO2_Wide
  - BehringerFCB1010UnO2_Compact
- Removed the separate compact script file to avoid ambiguity and duplicate maintenance.
- Updated README to describe the single-file distribution model.

## Why
- In practice, only the wide entry was visible with the prior multi-file approach in this setup.
- Single-file dual registration is more robust for Cubase script discovery and easier to distribute.
- End users can choose layout variant in Cubase without opening any editor.

## Validation Performed
- Verified both device variants are registered in code from one entry script.
- Verified layout preset assignment per variant is explicit and deterministic.
- Verified transport/mapping logic remains shared and unchanged.
- Verified JavaScript file has no reported errors after refactor.

## Risk and Follow-Up
- Cubase may require Reload Scripts before both device entries appear.
- If only one entry is still shown, remove and re-add the MIDI Remote device once in Cubase Manager to refresh cached assignments.