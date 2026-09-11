# Development Guide

## Scope

This project provides a Cubase MIDI Remote script for the Behringer FCB1010 (UnO2 setup).

Primary behavior documentation artifacts:

- `README.md`
- `UnO2_Cubase_OBS_Setup.txt`

## Requirements

- Cubase with MIDI Remote support
- Controller configured to send note events on MIDI channel 10
- Node.js 18 or newer for validation scripts
- GNU Make or a compatible Make implementation for the `make` targets

The automated checks use Node.js and are intended for Linux, macOS, and Windows
environments that provide Make. On systems without Make, run the documented
Node.js commands directly.

## Local Workflow

1. Edit `Behringer_BehringerFCB1010UnO2.js`.
2. Place/update the script in Cubase local MIDI Remote script path.
3. In Cubase, run `MIDI Remote -> Scripting Tools -> Reload Scripts`.
4. Validate transport behavior and lamps.

## VS Code Extension Workflow

The repository includes the local `UnO2 Language Support` extension under
`vscode-uno2-language/`. The workspace recommends the local extension together
with ESLint and Markdownlint. Use the `Run UnO2 Language Extension`
configuration in `.vscode/launch.json`, or run:

```bash
make extension-dev
```

To package and install the extension permanently:

```bash
make install-extension
```

The available Make targets are:

- `make package` builds the VSIX.
- `make install-extension` builds and installs the VSIX in VS Code.
- `make check` runs all automated pre-PR checks.
- `make validate` checks the MIDI Remote script syntax.
- `make validate-json` checks the shared JSON and extension JSON files.
- `make validate-extension` checks the UnO2 extension manifest, grammar, theme, and setup fixture.
- `make markdown-links` checks relative Markdown links, including untracked documentation files.
- `make validate-current-js FILE=path/to/file.js` checks another JavaScript file.
- `make extension-dev` starts an Extension Development Host with the local extension loaded.
- `make clean` removes the generated VSIX.

The extension contributes the `UnO2 Syntax Colors` theme. Select it through
**Preferences: Color Theme** when using the VSIX in another workspace. The
repository keeps its workspace token colors as well, so the checked-in setup
file retains the same appearance without a theme switch.

The local `UnO2_Bedienungsanleitung.pdf` is optional reference material and is
ignored by Git. It is not part of the distributable project; syntax validation
uses the maintained setup fixture and the documented UnO2 syntax target.

Markdownlint uses `.markdownlint.json` to permit the repository's intentional
HTML branding and compact legacy list formatting. The configuration keeps
content checks enabled while suppressing presentation-only rules that would
otherwise report the established README layout and long release-note lines.

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

## Documentation Consistency Checklist

- For each mapping or behavior change, cross-check FS role/note assignments across:
  - `Behringer_BehringerFCB1010UnO2.js`
  - `README.md`
  - `UnO2_Cubase_OBS_Setup.txt`
- Ensure transport-role names (for example Rewind/Forward, Tap/Click) are identical in code and docs.

## Documentation Link Sanity Check

Run this local check before PR creation when Markdown links were changed. It
checks inline relative links and file existence, including untracked Markdown
files; it does not validate reference-style links or heading anchors:

```bash
node scripts/check-markdown-links.js
```

## Automation Consistency

When workflow or label behavior changes, verify consistency across:

- `.github/workflows/label-sync.yml`
- `.github/workflows/pr-auto-label.yml`
- `.github/labels.yml`

Checklist:

- Every label referenced in workflow logic is defined in `.github/labels.yml`.
- Workflow trigger and permission updates are reflected in documentation entries under `docs/`.
