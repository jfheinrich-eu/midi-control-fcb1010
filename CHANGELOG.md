# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog, and this project aims to follow Semantic Versioning.

## [Unreleased]

## [0.2.0] - 2026-03-25 (revised)

### Changed
- README aligned with repository identity and GitHub best-practice navigation.
- Driver script refactored to replace behavior-relevant magic numbers with named constants and explicit index mappings.
- Footswitch position generation refactored to loop-based grid construction with inline rationale for row/column ordering.
- UnO2 setup documentation aligned with active FS5/FS9 and FS6/FS7 mapping semantics.
- UnO2 setup note and velocity literals replaced by named constants for safer maintenance.
- Added repository-local slash command prompts for focused review and commit planning workflows.
- Updated contributor guidance to include slash-command-based commit preparation.
- Fixed competing stop-lamp callbacks (C1): stop lamp is now driven exclusively by play-state inversion.
- Replaced all `arguments[n]` callback patterns with named parameters (W2).
- Renamed `tapTempo.smoothing` to `tapTempo.historyWeight` for semantic clarity (S1).
- Reverted `const`/`let` to `var` throughout the driver script: Cubase MIDI Remote engine runs in ES5 mode where `const` is a reserved keyword and causes a syntax error at load time.
- Improved JSDoc types from `{*}` to descriptive types across all functions.
- Pinned GitHub Actions to SHA-locked versions (S5).
- PR template and DEVELOPMENT.md now cover FS4, FS6, FS7, FS8 test cases (W3, W4).

## [0.1.0] - 2026-03-21

### Added
- Initial public repository baseline for `jfheinrich-eu/midi-control-fcb1010`.
- Repository governance files (`CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `SUPPORT.md`).
- GitHub collaboration templates (issue templates and pull request template).
- Repository hygiene files (`.editorconfig`, `.gitattributes`, `.gitignore`, `CODEOWNERS`).
- MIT `LICENSE`.

### Notes
- Historical detailed engineering logs remain in `docs/` with date-based entries.
