# Behringer FCB1010 UnO2 - Cubase MIDI Remote Script

## Idea
This script implements a focused, reliable musician-friendly Cubase transport workflow for a Behringer FCB1010 (UnO2 setup). The first three footswitches are dedicated to Record, Play, and Stop, with deterministic recording stop behavior.

The on-screen surface is intentionally laid out like the real FCB1010 pedalboard: two expression pedal areas at the top and two rows of five footswitches below, so non-technical players can immediately recognize the device.

## Purpose
The main purpose is to make hands-free recording control robust and predictable for instrument players (especially guitarists) who cannot use mouse/keyboard while performing.

Implemented behavior:
- Footswitch 1 press (Note On, value 127): Start Recording
- Footswitch 1 release (Note Off, value 0): Stop Recording
- Immediately after footswitch 1 stops recording: send one Stop Play pulse
- Footswitch 2 press: Start Play
- Footswitch 3 press: Stop Play

Implemented surface design:
- The Cubase surface is visually arranged like a real FCB1010.
- Two expression pedal areas are shown at the top.
- Two rows of five footswitches are shown at the bottom.
- Footswitches 1 to 3 are now active and placed like the real pedalboard.

Design goals:
- Deterministic transport behavior
- No MIDI feedback loop
- No repeated stop bursts (debounced)

## Meaningful Script Extensions
Possible next steps to evolve this script into a complete FCB1010 profile:

1. Full functional FCB1010 mapping
- Keep the current pedalboard-like visual layout
- Turn all 10 footswitches into active Cubase controls
- Turn both expression pedals into usable continuous controllers
- Add readable labels that still stay musician-friendly

2. Multi-page mapping setup
- Page A: Recording / Transport
- Page B: Marker navigation (prev/next/insert)
- Page C: Track focus/navigation and monitor toggles
- Page D: QuickControls or plugin parameter banks

3. Multiple controller setups
- UnO2-specific profile (current)
- Stock FCB1010 profile
- Optional profile variants by MIDI channel or note map

4. Workflow safety features
- Configurable debounce timings
- Optional long-press actions
- Optional fail-safe stop command duplication (if host setup needs it)

5. Extended DAW control
- Punch In / Punch Out
- Cycle On/Off
- Metronome toggle
- Marker and locator control

## Usage
### Basic setup
1. Place the script in the Cubase MIDI Remote local scripts folder.
2. Reload scripts in Cubase (MIDI Remote -> Scripting Tools -> Reload Scripts).
3. Add/select the device in MIDI Remote Manager.
4. Ensure your FCB1010 sends the configured notes on MIDI channel 10:
	- Footswitch 1 -> Note 36
	- Footswitch 2 -> Note 38
	- Footswitch 3 -> Note 40

## MIDI Configuration
This script currently uses the first three footswitches.

Required triggers for the current script:

| Footswitch | Function | MIDI Type | MIDI Channel | Note | Press | Release | Behavior |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Record | Note | 10 | 36 | 127 | 0 | Momentary |
| 2 | Play | Note | 10 | 38 | 127 | 0 | Momentary |
| 3 | Stop | Note | 10 | 40 | 127 | 0 | Momentary |

### What to configure in UnO2 Control Center
In the UnO2 Control Center editor, create or edit the footswitch assignments so that the first three switches send these note events:

1. Select the preset or mode you want to use for Cubase control.
2. Select footswitch 1 and configure Note 36 on MIDI channel 10.
3. Select footswitch 2 and configure Note 38 on MIDI channel 10.
4. Select footswitch 3 and configure Note 40 on MIDI channel 10.
5. Set all three switches to momentary, not toggle/latch.
6. Make sure press sends Note On with velocity/value 127.
7. Make sure release sends Note Off, or an equivalent zero-value release event.

### Important behavior note
This script is designed for press-and-release logic.

That means:
- Footswitch 1 press starts recording.
- Footswitch 1 release stops recording.
- After stop recording, Cubase also receives Stop Play once.
- Footswitch 2 press starts playback.
- Footswitch 3 press stops playback.

If the UnO2 switch is configured as toggle/latching instead of momentary, the workflow will not behave correctly.

### Recommended Cubase-dedicated UnO2 setup
If you want one bank dedicated to Cubase, the simplest and most robust approach is:
- Reserve one preset/bank for Cubase transport control.
- Assign footswitches 1 to 3 exactly as described above.
- Leave the other switches unused for now, or assign them later as the script grows.

### Suggested note map for a future full 10-switch setup
The workspace already contains a related UnO2 mapping using this note layout on MIDI channel 10:

| Footswitch | MIDI Channel | Note |
| --- | --- | --- |
| 1 | 10 | 36 |
| 2 | 10 | 38 |
| 3 | 10 | 40 |
| 4 | 10 | 41 |
| 5 | 10 | 43 |
| 6 | 10 | 45 |
| 7 | 10 | 47 |
| 8 | 10 | 48 |
| 9 | 10 | 50 |
| 10 | 10 | 52 |

This is not required for the current one-switch script, but it is a sensible base if you want to keep your UnO2 configuration aligned with a future complete FCB1010 Cubase profile.

## Suggested Footswitch Layout
The following layout is meant to stay easy to understand for a regular guitarist. It avoids abstract technical naming and follows typical live or recording priorities.

| Footswitch | Suggested Function | MIDI Channel | Note | Suggested UI Label |
| --- | --- | --- | --- | --- |
| 1 | Record Start / Stop | 10 | 36 | Record |
| 2 | Play | 10 | 38 | Play |
| 3 | Stop | 10 | 40 | Stop |
| 4 | Cycle On / Off | 10 | 41 | Cycle |
| 5 | Metronome On / Off | 10 | 43 | Click |
| 6 | Previous Marker | 10 | 45 | Prev Marker |
| 7 | Next Marker | 10 | 47 | Next Marker |
| 8 | Undo | 10 | 48 | Undo |
| 9 | Monitor Selected Track | 10 | 50 | Monitor |
| 10 | Talkback / User Function | 10 | 52 | User |

Notes:
- Footswitches 1 to 3 are already implemented in the current script.
- Footswitches 4 to 10 are suggested extensions for the next version.
- The labels are intentionally simple and musician-friendly.

### Expression pedals
The current script only draws both expression pedals in the Cubase surface for visual familiarity.

At the moment:
- Expression pedal A is not mapped to a Cubase function.
- Expression pedal B is not mapped to a Cubase function.

You can leave both pedals unassigned for now, or prepare them later for volume, wah-style plugin control, QuickControls, or monitor/send levels.

### Example workflow (your scenario)
Guitar tube amp setup -> line out -> Cubase Elements 14 with this MIDI Remote script -> OBS (streaming/recording).

Control architecture:
- Behringer FCB1010 is the physical foot controller.
- MIDIKey2Key is used to control OBS.
- This MIDI Remote script controls Cubase transport/record logic.

Result:
- Recording start and stop can be performed in sync from the foot controller.
- Cubase recording and OBS capture can be started/stopped as one practical workflow chain.

## Credits
- Script author: JFHeinrich
- Script engineering and iterative refinement were created with help from GitHub Copilot (GPT-5.3-Codex).
