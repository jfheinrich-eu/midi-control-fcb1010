# Footswitch Row Order And Tap/Click Swap

## Summary

Updated the Cubase MIDI Remote surface so the footswitch rows now match the physical FCB1010 layout:

- FS1-FS5 are displayed in the lower row.
- FS6-FS10 are displayed in the upper row.

Also swapped the functional assignments for FS5 and FS9:

- FS5 now triggers Tap Tempo.
- FS9 now toggles the metronome click.

## Script Changes

- Swapped the footswitch position order in the surface geometry while keeping FS numbering stable.
- Moved the TAP inner button label from FS9 to FS5.
- Reassigned the metronome host binding from FS5 to FS9.
- Reassigned the tap tempo runtime handler from FS9 to FS5.
- Updated the displayed role labels so the UI text matches the new assignments.

## Documentation Changes

- Updated README.md to reflect the physical row order and the new FS5/FS9 function map.
- Updated UnO2_Cubase_OBS_Setup.txt so the documented UnO2 bank assignment matches the script.

## Verification

- The Cubase surface should now visually match the controller row order.
- Pressing FS5 should drive tap tempo.
- Pressing FS9 should toggle the metronome click.