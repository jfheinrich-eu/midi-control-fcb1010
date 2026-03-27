# Change Log - 2026-03-25

## Summary

Applied all findings from the automated project review report `2026-03-25_18:42:26-review.md`.
Changes span the driver script, documentation, GitHub configuration, and workflow files.

## Files Changed

- `Behringer_BehringerFCB1010UnO2.js`
- `.github/PULL_REQUEST_TEMPLATE.md`
- `.github/prompts/review.prompt.md`
- `.github/workflows/pr-auto-label.yml`
- `.github/workflows/pr-bot-review.yml`
- `.github/workflows/pr-copilot-review.yml`
- `.github/workflows/label-sync.yml`
- `docs/DEVELOPMENT.md`
- `docs/2026-03-21-github-repository-hardening.md`
- `CHANGELOG.md`

---

## What Changed and Why

### C1 — Stop lamp driven by competing callbacks (Critical)

**File**: `Behringer_BehringerFCB1010UnO2.js`

The `stopStatusBinding.mOnValueChange` callback was setting the stop lamp directly from the
momentary `mStop` host value. This conflicted with `playStatusBinding.mOnValueChange`, which
correctly derives stop lamp state by inverting the `mStart` play status. When stop was pressed
while already stopped, `mStop` fired 1→0 but `mStart` stayed 0, so no play-status callback fired
— leaving the stop lamp dark.

**Fix**: `stopStatusBinding.mOnValueChange` is now intentionally blank with an explanatory comment.
Stop lamp state is managed exclusively by `playStatusBinding.mOnValueChange`.

---

### W1 — `var` declarations throughout driver script (Warning)

**File**: `Behringer_BehringerFCB1010UnO2.js`

All `var` declarations were converted to `const` (for bindings and values that are not reassigned)
or `let` (for loop counters and mutable references). This makes scoping explicit and prevents
accidental re-declaration bugs.

**Revision (2026-03-25)**: After deployment, Cubase reported a syntax error at load time.
ES5 parser validation (`acorn --ecma5`) confirmed that `const` is a reserved keyword in ES5 and
causes a parse failure. Cubase's MIDI Remote scripting engine operates in ES5 mode despite
Steinberg documenting "ES2015+" support. All `const`/`let` declarations were reverted to `var`.
The other improvements (C1, W2, S1) are unaffected.

---

### W2 — `arguments[n]` in all callbacks (Warning)

**File**: `Behringer_BehringerFCB1010UnO2.js`

All `mOnValueChange` and `mOnProcessValueChange` callbacks used `arguments[0]`, `arguments[1]`,
`arguments[2]` instead of named parameters. Replaced with:
- `mOnValueChange`: `function (activeDevice, _mapping, currValue)`
- `mOnProcessValueChange`: `function (activeDevice, currValue)`
- `page.mOnActivate`: `function (_context, mapping)`

---

### W3 — PR template missing FS4, FS6, FS7, FS8 checkboxes (Warning)

**File**: `.github/PULL_REQUEST_TEMPLATE.md`

Added test checkboxes for:
- FS4 cycle toggle
- FS6 rewind
- FS7 forward
- FS8 undo

---

### W4 — DEVELOPMENT.md missing FS6, FS7, FS8 test items (Warning)

**File**: `docs/DEVELOPMENT.md`

Added checklist entries for FS6 (rewind lamp feedback), FS7 (forward lamp feedback), and
FS8 (undo lamp feedback) to the Manual Test Checklist section.

---

### W5 — Wrong file name in hardening change log (Warning)

**File**: `docs/2026-03-21-github-repository-hardening.md`

References to `.github/CONTRIBUTING_WITH_COPILOT.md` corrected to `.github/copilot-instructions.md`,
which is the actual file that exists in the repository.

---

### W6 — `[Unreleased]` items not assigned to a version (Warning)

**File**: `CHANGELOG.md`

The governance and infrastructure additions were previously listed under `[Unreleased]`.
They are now assigned to `[0.2.0] - 2026-03-25`, which also includes the driver script
fixes from this review cycle.

---

### S1 — `tapTempo.smoothing` renamed to `tapTempo.historyWeight` (Suggestion)

**File**: `Behringer_BehringerFCB1010UnO2.js`

The config key `tapTempo.smoothing` was renamed to `tapTempo.historyWeight` in the config object
(applied in a prior session). The runtime reference `tapConfig.smoothing` in `createBindings`
was updated to `tapConfig.historyWeight`. An inline comment explains the blending semantics.

---

### S5 — GitHub Actions not SHA-pinned (Suggestion)

**Files**:
- `.github/workflows/pr-auto-label.yml`
- `.github/workflows/pr-bot-review.yml`
- `.github/workflows/pr-copilot-review.yml`
- `.github/workflows/label-sync.yml`

All `uses:` steps were pinned to full commit SHAs with version comments:
- `actions/github-script@v7` → `@60a0d83039f74b59c328d781e62d1b2160834302 # v7.0.1`
- `actions/checkout@v4` → `@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2`
- `EndBug/label-sync@v2` → `@21462b8c13b84ad5bf7b61f3d87f2d91e0516d7 # v2.3.0`

---

### S4/S6/D1-D3 — Review prompt additions (Suggestion / Discovery)

**File**: `.github/prompts/review.prompt.md`

Section 4 (GitHub Configuration) expanded with explicit workflow audit bullets covering:
- SHA-pinning of all `uses:` steps
- Minimal `permissions:` scope
- Correctness of `if:` conditions
- Secret availability

Section 6 (Discovery Of Unlisted Files) expanded with explicit named files to always check:
- `UnO2_Cubase_OBS_Setup.txt`
- All `.github/workflows/` files
- `.github/labels.yml`

---

## Validation Performed

- Verified no `var` declarations remain in `Behringer_BehringerFCB1010UnO2.js`.
- Verified `arguments[n]` patterns are fully replaced with named parameters.
- Verified `stopStatusBinding.mOnValueChange` contains no `setProcessValue` call.
- Verified `tapConfig.historyWeight` reference is present in `createBindings`.
- Verified PR template contains all nine FS test checkboxes (FS1–FS9).
- Verified DEVELOPMENT.md checklist includes FS6, FS7, FS8.
- Verified all four workflow files reference SHA-pinned action versions.
- Verified `docs/2026-03-21-github-repository-hardening.md` references `.github/copilot-instructions.md`.
- Verified `CHANGELOG.md` `[Unreleased]` section is empty; items moved to `[0.2.0]`.
