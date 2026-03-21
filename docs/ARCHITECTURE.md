# Architecture Overview

## Main Script

- `Behringer_BehringerFCB1010UnO2.js`

The script is organized around three key layers:

1. Configuration
- Driver metadata
- Surface geometry and layout presets
- MIDI note mapping
- Footswitch role labels
- Runtime state keys

2. Surface Construction
- `createSurface()` creates buttons, lamps, and labels
- `makeFootswitchPositions()` controls visual row/column placement
- `resolveSurfaceConfig()` merges the selected layout preset

3. Host Bindings and Runtime Logic
- `createBindings()` connects surface values to Cubase transport and commands
- Debounced stop pulse handling
- Tap tempo handler on FS5
- Metronome toggle on FS9

## Layout System

Layout is currently selected through the top-level `LAYOUT` variable:

- `wide`
- `compact`

Preset geometry values are defined in `config.surface.layouts` and resolved at runtime.

## State and Safety

The script uses per-device state storage for robust behavior:

- Recording state tracking
- Stop pulse debounce timing
- Tap tempo interval and smoothing state

Defensive checks are used before processing runtime values to avoid invalid input propagation.
