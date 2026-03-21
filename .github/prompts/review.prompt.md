---
description: "Full project review: currency, correctness, best practices, and rule compliance including .gitignore. Use when: running a comprehensive audit of the entire project."
agent: agent
---

# Full Project Review

Perform a thorough, critical review of the entire project. Check every area listed below. Report all findings grouped by severity at the end.

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
- `.github/copilot-instructions.md`: up to date with current project rules?
- Links in README and docs: valid relative paths? No dead links?

---

## 5. Rule Compliance

- All identifiers in code are descriptive (only `i`, `j`, `k` permitted as single-letter names)?
- All file content (code, comments, docs) is written in English?
- Every change since project inception is documented in either `README.md` or `docs/`?
- No third-party code present without attribution and license?
- No code or content from this repository has been exposed externally?

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
