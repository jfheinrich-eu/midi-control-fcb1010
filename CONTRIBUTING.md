# Contributing

Thanks for contributing to `jfheinrich-eu/midi-control-fcb1010`.

## Before You Start

- Read `README.md` for project scope and usage.
- Open an issue before implementing larger changes.
- Keep all code and documentation in English.

## Development Principles

- Follow Steinberg MIDI Remote API conventions.
- Keep behavior predictable for live foot control usage.
- Prefer small, focused, and readable changes.
- Avoid unverified assumptions; document uncertainty clearly.

## Local Testing

1. Place the script in Cubase MIDI Remote local scripts folder.
2. Reload scripts in Cubase.
3. Validate core behavior manually:
   - FS1 press/release record flow
   - FS2 play/release stop pulse
   - FS3 stop and record-off behavior
   - FS4 cycle toggle
   - FS5 tap tempo
   - FS6 rewind lamp feedback
   - FS7 forward lamp feedback
   - FS8 undo lamp feedback
   - FS9 click toggle
   - UI row order matches hardware orientation
4. Confirm no regressions in transport logic and lamp feedback.

## Pull Requests

- Use focused PRs.
- Include a short "what/why/how tested" summary.
- Update relevant docs in `docs/` for every behavior or architecture change.
- Keep naming and style consistent with existing files.

## Commit Guidance

- Use clear, descriptive commit messages.
- Group related changes only.
- Do not mix refactors and behavior changes unless required.
