---
description: "Full project review: currency, correctness, best practices, and rule compliance including .gitignore. Use when: running a comprehensive audit of the entire project."
agent: agent
---

# Full Project Review

Perform a thorough, critical review of the entire project. Check every area listed below. Report all findings grouped by severity at the end.

This prompt must produce two outputs:
- A complete review in chat
- A persisted Markdown report file in the repository

---

## 1. Code Quality — `Behringer_BehringerFCB1010UnO2.js`

- Steinberg MIDI Remote API v1 compliance: naming conventions, surface topology, value bindings
- JavaScript best practices: `const`/`let` usage, no `var` where avoidable, no implicit globals
- Clean code: function size, responsibility, naming clarity
- **Identifier names**: flag any single-letter variable names that are NOT loop counters (`i`, `j`, `k`)
- JSDoc type annotations: present and accurate for all public-facing functions and config objects
- Logic correctness: tap tempo smoothing, debounce logic, metronome binding, row position mapping
- Edge cases: MIDI note conflicts, out-of-range values, missing state keys

---

## 2. Documentation Currency

- `README.md`: reflects current FS assignments (FS1–FS9), layout options, and installation steps?
- `UnO2_Cubase_OBS_Setup.txt`: reflects current FS note assignments, role names, and press/release behavior?
- `docs/ARCHITECTURE.md`: accurate against actual script structure?
- `docs/DEVELOPMENT.md`: setup steps and test checklist still valid?
- `CHANGELOG.md`: are all recent changes logged with correct version and date?
- All `docs/2026-*.md` change logs: do they match what is actually in the code?
- Flag any doc that contradicts the current code.

---

## 3. Repository Health

- `.gitignore`: appropriate for a JavaScript/Node.js project on Linux/Windows/macOS? Missing patterns (e.g., `.DS_Store`, `Thumbs.db`, `*.log`, editor temp files, `node_modules`)?
- `LICENSE`: present, year correct, owner correct?
- `CODEOWNERS`: present, correct owner handle?
- `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `SUPPORT.md`: present and internally consistent?
- `.editorconfig`: consistent with actual file formatting in the repo?
- `.gitattributes`: correct `eol` and binary rules for all file types present?

---

## 4. GitHub Configuration

- `.github/ISSUE_TEMPLATE/`: bug report, feature request, and `config.yml` present and well-formed?
- `.github/PULL_REQUEST_TEMPLATE.md`: checklist covers FS1–FS9, tap tempo, metronome, regression?
- `.github/copilot-instructions.md`: present and up to date with current project rules? (See [.github/copilot-instructions.md](../copilot-instructions.md))
- Links in README and docs: valid relative paths? No dead links?
- `.github/workflows/`: are all workflow files present and well-formed?
  - Do all `uses:` steps reference actions pinned to a full SHA (not a floating tag like `@v1`)?
  - Are `permissions:` scopes minimal (least-privilege)?
  - Are `if:` conditions correct and not vacuously true?
  - Are any secrets referenced actually expected to exist in the repository?
- `.github/labels.yml`: are all labels used in `pr-auto-label.yml` and other workflows defined here?
  - Are label names, colors, and descriptions consistent with the project's PR labeling strategy?

---

## 5. Rule Compliance

- All identifiers in code are descriptive (only `i`, `j`, `k` permitted as single-letter names)?
- All file content (code, comments, docs) is written in English?
- Every change since project inception is documented in either `README.md` or `docs/`?
- No third-party code present without attribution and license?
- No code or content from this repository has been exposed externally?

---

## 6. Discovery Of Unlisted Files

- Look for newly added or previously unreviewed files that are relevant to quality, behavior, security, release process, or maintainability but are not explicitly covered by sections 1-5.
- Always explicitly check these files as part of discovery:
  - `UnO2_Cubase_OBS_Setup.txt` — verify FS descriptions match the current driver script assignments.
  - All files under `.github/workflows/` — verify presence, structure, and SHA-pinning of all `uses:` steps.
  - `.github/labels.yml` — verify all labels referenced in workflows are defined here.
- For each relevant file found, report:
  - why the file is relevant,
  - whether it should be integrated into an existing review section,
  - a concrete suggestion for where and how to integrate it.

---

## Reporting Format

Group findings by severity:

### Critical
> Correctness issues, security concerns, API misuse, or broken functionality.

### Warning
> Rule violations, outdated documentation, inconsistent configuration.

### Suggestion
> Improvements to clarity, structure, or completeness that are not strictly required.

For each finding:
- **File**: path (and line number if applicable)
- **Issue**: concise description
- **Fix**: concrete recommendation

---

## Persisted Report (Required)

After completing the review, always create a Markdown report file in this location:

- `docs/reviews/YYYY-MM-DD-review.md`

If a file for the same date already exists, create a new one with a time suffix:

- `docs/reviews/YYYY-MM-DD-HH-mm-review.md`

Do not overwrite an existing review report.

Use GitHub-flavored Markdown and this template structure.

```markdown
# Full Project Review Report

- Date: YYYY-MM-DD
- Repository: owner/name
- Branch reviewed: <branch>
- Reviewer: GitHub Copilot (GPT-5.3-Codex)

## Scope

- Code Quality (`Behringer_BehringerFCB1010UnO2.js`)
- Documentation Currency (`README.md`, `docs/ARCHITECTURE.md`, `docs/DEVELOPMENT.md`, `CHANGELOG.md`, `UnO2_Cubase_OBS_Setup.txt`, `docs/2026-*.md`)
- Repository Health (`.gitignore`, `LICENSE`, `CODEOWNERS`, `.editorconfig`, `.gitattributes`, governance files)
- GitHub Configuration (`.github/ISSUE_TEMPLATE/`, `.github/PULL_REQUEST_TEMPLATE.md`, `.github/copilot-instructions.md`, link checks)
- Rule Compliance (naming, language, documentation discipline, attribution integrity)

## Severity Summary

- Critical: <count>
- Warning: <count>
- Suggestion: <count>

## Critical

<List findings or write "No critical findings.">

### C1: <short title>
- File: path/to/file.ext:line
- Issue: <concise description>
- Fix: <concrete recommendation>

## Warning

<List findings or write "No warning findings.">

### W1: <short title>
- File: path/to/file.ext:line
- Issue: <concise description>
- Fix: <concrete recommendation>

## Suggestion

<List findings or write "No suggestion findings.">

### S1: <short title>
- File: path/to/file.ext:line
- Issue: <concise description>
- Fix: <concrete recommendation>

## Open Questions / Assumptions

- <question or assumption>

## Validation Notes

- Review method: static analysis of repository files and configuration.
- Runtime validation performed: <yes/no and details>

## Change Safety

- This review report does not modify runtime behavior.
```

GitHub and best-practice rules for the report:
- Use exactly one H1 title.
- Keep headings stable and concise.
- Use relative file paths and include line numbers when known.
- Keep findings actionable: each finding must include File, Issue, and Fix.
- Avoid vague wording; prefer concrete, verifiable statements.
- Keep language English only.

After writing the file, provide a short chat summary and include the exact report path.
