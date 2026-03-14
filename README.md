# Behringer FCB1010 UnO2 - Cubase MIDI Remote Script

## Idea
This script implements a focused, reliable one-button recording workflow for Cubase with a Behringer FCB1010 (UnO2 setup). A single footswitch event controls recording start/stop and guarantees a clean transport stop sequence afterward.

The on-screen surface is intentionally laid out like the real FCB1010 pedalboard: two expression pedal areas at the top and two rows of five footswitches below, so non-technical players can immediately recognize the device.

## Purpose
The main purpose is to make hands-free recording control robust and predictable for instrument players (especially guitarists) who cannot use mouse/keyboard while performing.

Implemented behavior:
- Press footswitch (Note On, value 127): Start Recording
- Release footswitch (Note Off, value 0): Stop Recording
- Immediately after recording turns off: send one Stop Play pulse

Design goals:
- Deterministic transport behavior
- No MIDI feedback loop
- No repeated stop bursts (debounced)

## Meaningful Script Extensions
Possible next steps to evolve this script into a complete FCB1010 profile:

1. Full FCB1010 surface representation
- Add all 10 footswitches as independent buttons
- Add both expression pedals as continuous controllers
- Create logical labels and a visual layout matching the hardware

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
4. Ensure your FCB1010 sends Note 36 on MIDI channel 10 for the configured footswitch.

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
