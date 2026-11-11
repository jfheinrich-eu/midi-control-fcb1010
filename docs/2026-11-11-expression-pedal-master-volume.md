# Expression Pedal Master Output Volume

- Date: 2026-11-11
- Files changed:
  - `Behringer_BehringerFCB1010UnO2.js`
  - `README.md`
  - `UnO2_Cubase_OBS_Setup.txt`
  - `docs/ARCHITECTURE.md`
  - `docs/DEVELOPMENT.md`
  - `CONTRIBUTING.md`
  - `.github/PULL_REQUEST_TEMPLATE.md`
  - `CHANGELOG.md`
  - `docs/2026-11-11-expression-pedal-master-volume.md`
- What changed and why:
  - Added an absolute CC 106 binding for expression pedal A and connected it to the first output channel volume in Cubase's MixConsole output bank, normally the Stereo Out/master output.
  - Enabled scaled value takeover to reduce unexpected jumps when the physical pedal and current Cubase volume do not match.
  - Updated setup, development, contribution, architecture, and PR checklist documentation. Expression pedal B remains unassigned.
- Validation performed:
  - `make check` — passed.
  - Cubase and physical pedal behavior — not tested; Cubase and the FCB1010 are not available in this environment.
