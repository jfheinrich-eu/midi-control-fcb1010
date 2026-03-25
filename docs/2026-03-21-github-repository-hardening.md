# Change Log - 2026-03-21

## Summary

Expanded the project structure to a public GitHub-ready repository baseline for `jfheinrich-eu/midi-control-fcb1010`.

## Files Changed

- README.md
- LICENSE
- CODEOWNERS
- CONTRIBUTING.md
- CODE_OF_CONDUCT.md
- SECURITY.md
- SUPPORT.md
- CHANGELOG.md
- .gitignore
- .editorconfig
- .gitattributes
- .github/copilot-instructions.md
- .github/ISSUE_TEMPLATE/bug_report.md
- .github/ISSUE_TEMPLATE/feature_request.md
- .github/ISSUE_TEMPLATE/config.yml
- .github/PULL_REQUEST_TEMPLATE.md
- docs/DEVELOPMENT.md
- docs/ARCHITECTURE.md
- Removed: copilot_instructions.md

## What Changed

- Added repository legal baseline with MIT license.
- Added ownership metadata via CODEOWNERS (`@jfheinrich`).
- Added contribution, conduct, support, and security governance documents.
- Added a semantic-version-ready changelog entry point.
- Added repository hygiene files for text normalization, editor consistency, and ignore patterns.
- Added GitHub collaboration templates for bug reports, feature requests, and pull requests.
- Added technical maintainer documentation (`docs/DEVELOPMENT.md`, `docs/ARCHITECTURE.md`).
- Moved Copilot-specific contributor guidance from root to `.github/copilot-instructions.md`.
- Updated README to:
  - Include repository identity (`jfheinrich-eu/midi-control-fcb1010`).
  - Link key governance files.
  - Correct active footswitch coverage from 1-8 to 1-9.
  - Replace outdated dual-device wording with current layout-selection behavior (`LAYOUT` variable).

## Why

- Prepare the project for professional public distribution on GitHub.
- Reduce onboarding friction for contributors and users.
- Align documentation claims with current script runtime behavior.
- Establish maintainable project governance and collaboration standards.

## Validation Performed

- Verified all new top-level and `.github` files were created.
- Verified `copilot_instructions.md` content was preserved under `.github/copilot-instructions.md`.
- Verified README contains repository links and corrected functional statements.
- Verified issue template config uses an absolute GitHub support link.
