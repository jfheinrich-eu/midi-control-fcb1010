# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog, and this project aims to follow Semantic Versioning.

## [Unreleased]

### Added
- Repository governance files (`CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `SUPPORT.md`).
- GitHub collaboration templates (issue templates and pull request template).
- Repository hygiene files (`.editorconfig`, `.gitattributes`, `.gitignore`, `CODEOWNERS`).
- MIT `LICENSE`.

### Changed
- README aligned with repository identity and GitHub best-practice navigation.
- Driver script refactored to replace behavior-relevant magic numbers with named constants and explicit index mappings.
- Footswitch position generation refactored to loop-based grid construction with inline rationale for row/column ordering.
- UnO2 setup documentation aligned with active FS5/FS9 and FS6/FS7 mapping semantics.
- UnO2 setup note and velocity literals replaced by named constants for safer maintenance.
- Added repository-local slash command prompts for focused review and commit planning workflows.
- Updated contributor guidance to include slash-command-based commit preparation.

## [0.1.0] - 2026-03-21

### Added
- Initial public repository baseline for `jfheinrich-eu/midi-control-fcb1010`.

### Notes
- Historical detailed engineering logs remain in `docs/` with date-based entries.
