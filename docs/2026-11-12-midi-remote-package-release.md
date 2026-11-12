# MIDI Remote Release Package

- Date: 2026-11-12
- Files changed:
  - `.github/workflows/publish-midi-remote-script.yml`
  - `README.md`
  - `docs/DEVELOPMENT.md`
  - `CHANGELOG.md`
  - `docs/2026-11-12-midi-remote-package-release.md`
- What changed and why:
  - Added a GitHub Release-published workflow that runs the project checks and attaches a ZIP containing the MIDI Remote driver to each release.
  - Packaged the script using Steinberg's vendor/device hierarchy under `Driver Scripts/Local/Behringer/BehringerFCB1010UnO2/`.
  - Documented manual installation into Cubase's Local scripts folder; the workflow distributes the script but does not install it on user systems.
- Validation performed:
  - `make check` — passed.
  - Built the ZIP with Python's standard library and verified the archive contains exactly the driver at the expected vendor/device path and with unchanged contents.
  - `git diff --check` — passed.
  - `actionlint` and a GitHub-hosted release run were unavailable in this environment; the workflow was reviewed but not executed end to end.
