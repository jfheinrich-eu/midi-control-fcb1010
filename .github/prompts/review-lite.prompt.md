---
description: "Fast project review focused on Critical and Warning findings with actionable fixes and required markdown report output. Use when: quick quality gate before commit or PR."
agent: agent
---

# Review Lite

Perform a focused review of the repository with a strict quality-gate mindset.

Primary objective:
- Identify Critical and Warning findings only.
- Report Suggestion findings only if they prevent maintainability in the short term.

## Scope

1. Code quality and correctness in `Behringer_BehringerFCB1010UnO2.js`
2. Documentation correctness in:
- `README.md`
- `docs/ARCHITECTURE.md`
- `docs/DEVELOPMENT.md`
- `CHANGELOG.md`
3. GitHub and repository hygiene in:
- `.github/PULL_REQUEST_TEMPLATE.md`
- `.github/ISSUE_TEMPLATE/`
- `.gitignore`, `.editorconfig`, `.gitattributes`, `CODEOWNERS`, `LICENSE`

## Rules

- Prioritize defects, behavior risks, regressions, and policy violations.
- Every finding must include: File, Issue, Fix.
- Use concrete, verifiable statements only.
- Use relative file paths and line numbers when known.
- Keep all content in English.

## Reporting Format

### Critical
> Correctness issues, API misuse, broken behavior, or high-confidence risk.

### Warning
> Documentation drift, missing checks, policy/process misalignment, or reliability risk.

### Suggestion (optional)
> Include only if it directly improves near-term maintainability.

## Persisted Report (Required)

After the review, always create a Markdown file at:

- `docs/reviews/YYYY-MM-DD-review-lite.md`

If that file already exists, create:

- `docs/reviews/YYYY-MM-DD-HH-mm-review-lite.md`

Do not overwrite existing files.

Use this template:

```markdown
# Review Lite Report

- Date: YYYY-MM-DD
- Repository: owner/name
- Branch reviewed: <branch>
- Reviewer: GitHub Copilot (GPT-5.3-Codex)

## Severity Summary

- Critical: <count>
- Warning: <count>
- Suggestion: <count>

## Critical

<findings or "No critical findings.">

### C1: <short title>
- File: path/to/file.ext:line
- Issue: <concise description>
- Fix: <concrete recommendation>

## Warning

<findings or "No warning findings.">

### W1: <short title>
- File: path/to/file.ext:line
- Issue: <concise description>
- Fix: <concrete recommendation>

## Suggestion

<optional findings or "No suggestion findings.">

## Validation Notes

- Review method: static analysis.
- Runtime validation performed: <yes/no and details>
```

After writing the file, provide a concise chat summary and include the exact report path.
