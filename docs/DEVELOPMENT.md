# Development Guide

## Scope

This project provides a Cubase MIDI Remote script for the Behringer FCB1010 (UnO2 setup).

## Requirements

- Cubase with MIDI Remote support
- Controller configured to send note events on MIDI channel 10

## Local Workflow

1. Edit `Behringer_BehringerFCB1010UnO2.js`.
2. Place/update the script in Cubase local MIDI Remote script path.
3. In Cubase, run `MIDI Remote -> Scripting Tools -> Reload Scripts`.
4. Validate transport behavior and lamps.

## Manual Test Checklist

- FS1: record press/release flow
- FS2: play press/release stop pulse
- FS3: stop + record-off behavior
- FS4: cycle toggle
- FS5: tap tempo
- FS6: rewind momentary behavior
- FS7: forward momentary behavior
- FS8: undo trigger and lamp feedback
- FS9: metronome click toggle
- UI row order matches hardware orientation
- Mapping consistency check: `FOOTSWITCH_NOTES_BY_ROW` (driver), `README.md` MIDI table, and `UnO2_Cubase_OBS_Setup.txt` are aligned after every mapping change

## Coding Guidelines

- Keep all source and documentation in English.
- Follow Steinberg MIDI Remote API conventions.
- Prefer focused changes and avoid unrelated refactors.
- Update docs in `docs/` for every behavior or architecture change.
