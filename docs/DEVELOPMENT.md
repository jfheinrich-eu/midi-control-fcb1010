# Development Guide

## Scope

This project provides a Cubase MIDI Remote script for the Behringer FCB1010 (UnO2 setup).

Primary behavior documentation artifacts:
- `README.md`
- `UnO2_Cubase_OBS_Setup.txt`

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

## Documentation Consistency Checklist

- For each mapping or behavior change, cross-check FS role/note assignments across:
  - `Behringer_BehringerFCB1010UnO2.js`
  - `README.md`
  - `UnO2_Cubase_OBS_Setup.txt`
- Ensure transport-role names (for example Rewind/Forward, Tap/Click) are identical in code and docs.

## Documentation Link Sanity Check

Run this lightweight local check before PR creation when markdown links were changed:

```bash
repo_root="$(git rev-parse --show-toplevel)"
cd "$repo_root"
failed=0

while IFS= read -r markdown_file; do
  while IFS= read -r link_target; do
    clean_target="${link_target%%#*}"
    [ -z "$clean_target" ] && continue
    echo "$clean_target" | grep -Eq '^(https?://|mailto:|[a-zA-Z]+:)' && continue

    if [[ "$clean_target" = /* ]]; then
      resolved_path="$repo_root$clean_target"
    else
      resolved_path="$(dirname "$markdown_file")/$clean_target"
    fi

    [ -e "$resolved_path" ] || {
      echo "BROKEN $markdown_file -> $link_target"
      failed=1
    }
  done < <(
    grep -oE '\\[[^]]+\\]\\([^)]+\\)' "$markdown_file" \
      | sed -E 's/^.*\\(([^)]+)\\)$/\\1/'
  )
done < <(git ls-files '*.md')

if [ "$failed" -ne 0 ]; then
  echo "Markdown link check failed."
  exit 1
fi

echo "Markdown link check passed."
```

## Automation Consistency

When workflow or label behavior changes, verify consistency across:

- `.github/workflows/label-sync.yml`
- `.github/workflows/pr-auto-label.yml`
- `.github/labels.yml`

Checklist:

- Every label referenced in workflow logic is defined in `.github/labels.yml`.
- Workflow trigger and permission updates are reflected in documentation entries under `docs/`.
