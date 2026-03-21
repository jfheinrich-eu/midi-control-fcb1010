# Change Report - 2026-03-21

## Scope

This report reviews all Markdown files in the docs folder and checks whether their statements are still aligned with the current project state.

Reviewed files:

- 2026-03-15-copilot-instructions.md
- 2026-03-15-footswitch-label-readability.md
- 2026-03-20-dual-device-layout-variants.md
- 2026-03-20-footswitch-single-line-layout.md
- 2026-03-20-single-file-dual-registration.md
- 2026-03-20-surface-layout-presets.md
- 2026-03-21-footswitch-row-order-and-tap-click-swap.md
- 2026-03-21-readme-header-branding.md

Reference baseline:

- Behringer_BehringerFCB1010UnO2.js
- README.md

## File Status Matrix

### Current

- 2026-03-15-copilot-instructions.md
  - Still relevant as process and quality baseline.
  - Matches current team workflow expectations.

- 2026-03-20-footswitch-single-line-layout.md
  - Single-line footswitch labeling is still implemented.
  - Geometry variables listed there are still present and active.

- 2026-03-20-surface-layout-presets.md
  - Preset-based layout architecture is still implemented.
  - The fallback behavior for invalid preset names is still correct.

- 2026-03-21-footswitch-row-order-and-tap-click-swap.md
  - Matches current mapping and visual order.
  - FS1-FS5 lower row and FS6-FS10 upper row are aligned with current script behavior.

- 2026-03-21-readme-header-branding.md
  - Matches current README header structure with centered title, logo, and tagline.

### Partially Outdated

- 2026-03-15-footswitch-label-readability.md
  - Contains useful historical rationale for readability hardening.
  - Mentions footswitchLabelWidthPadding, while current code uses explicit footswitchLabelWidth in layout presets.

- 2026-03-20-single-file-dual-registration.md
  - Correctly describes helper functions for variant registration infrastructure.
  - Overstates runtime behavior by implying both variants are actively registered in the current bootstrap path.

### Obsolete (Historical Only)

- 2026-03-20-dual-device-layout-variants.md
  - Documents a multi-file distribution step that was superseded later.
  - The referenced separate compact script file is no longer part of the current workspace state.

## Confirmed Contradictions

1. Dual-device availability is described as active in older docs and parts of README, but current bootstrap registers a single device configuration per run.
2. The legacy label-readability doc references footswitchLabelWidthPadding, which is not a current configuration key.

## Remaining Relevant Documentation (Logical Order)

The following files are the recommended active reading order for the current project state.

1. 2026-03-15-copilot-instructions.md
   - Process and quality guardrails.

2. 2026-03-20-surface-layout-presets.md
   - Core architecture for UI geometry and preset resolution.

3. 2026-03-20-footswitch-single-line-layout.md
   - Practical layout tuning model and current single-line label strategy.

4. 2026-03-21-footswitch-row-order-and-tap-click-swap.md
   - Current functional layout alignment with hardware and FS5/FS9 behavior.

5. 2026-03-21-readme-header-branding.md
   - Current README presentation and branding context.

## Consolidated Current-State Summary

### Functional Mapping

- Footswitch row order in UI matches hardware orientation:
  - Lower row: FS1-FS5
  - Upper row: FS6-FS10
- FS5 is Tap Tempo.
- FS9 is Click (Metronome) toggle.

### UI Architecture

- Surface layout is preset-driven (wide and compact presets).
- Footswitch labels are rendered in single-line format.
- Label safety is handled with normalized role names and defensive fallback behavior.

### Documentation Quality State

- Newer 2026-03-21 docs accurately reflect current implementation.
- Two older documents remain useful as historical context but should not be treated as authoritative for present runtime behavior.

## Recommendations

1. Treat this file as the primary status snapshot for 2026-03-21.
2. Keep partially outdated and obsolete docs for traceability, but mark them explicitly as historical in a future cleanup pass.
3. Align README device-variant wording with the actual bootstrap behavior to avoid user confusion.