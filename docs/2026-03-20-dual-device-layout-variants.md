# Change Log - 2026-03-20

> **Status: Historical document — superseded.**  
> This document describes the original two-file approach using separate `Behringer_BehringerFCB1010UnO2_Compact.js`. That approach was replaced by a single-file model. See [2026-03-20-single-file-dual-registration.md](2026-03-20-single-file-dual-registration.md) for the subsequent design, and README.md for the current behavior.

## Summary
Implemented two end-user-selectable MIDI Remote devices so users can choose wide or compact UI layout directly in Cubase without editing script files.

## Files Changed
- Behringer_BehringerFCB1010UnO2.js
- Behringer_BehringerFCB1010UnO2_Compact.js
- README.md

## What Changed
- Kept the existing script as the wide layout variant and assigned a dedicated device name:
  - BehringerFCB1010UnO2_Wide
- Added a second script variant file for compact layout:
  - Behringer_BehringerFCB1010UnO2_Compact.js
- Assigned a dedicated compact device name:
  - BehringerFCB1010UnO2_Compact
- Set a fixed default layout preset per script variant:
  - Wide script -> wide
  - Compact script -> compact
- Updated README to explain the two selectable device variants for non-technical users.

## Why
- End users should not need to edit scripts in an editor.
- Device-level selection in Cubase is safer and simpler for distribution.
- This avoids fragile runtime switching for geometry that is defined during surface creation.

## Validation Performed
- Verified both script files exist in the same device script folder.
- Verified each script has a unique device name to appear as separate choices in Cubase.
- Verified each script enforces the intended default layout preset.
- Verified core transport and MIDI binding logic remains unchanged across variants.

## Risk and Follow-Up
- Cubase script cache may require a manual Reload Scripts action to show both devices.
- If users still report clipping, tune only the selected variant preset values to avoid unintended global changes.