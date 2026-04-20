# 2026-04-20 - Commit Slash Command

## Date
2026-04-20

## Files changed
- .github/prompts/commit.prompt.md
- CONTRIBUTING.md

## What changed
- Added a repository-local `/commit` slash command prompt in `.github/prompts/commit.prompt.md`.
- Added a short contributor note in `CONTRIBUTING.md` that points maintainers to the `/commit` slash command for guided commit preparation.
- Defined an interactive workflow for reviewing non-ignored untracked files before any commit planning.
- Required grouping of staged and unstaged changes into logical conventional-commit units based on intent rather than index state.
- Added explicit handling for breaking-change detection, including a targeted user question when breaking status cannot be inferred safely.
- Added review checkpoints so each proposed commit can be accepted, edited, or canceled before execution.
- Added loop-dependency guardrails so mutually dependent changes are merged instead of split into unsafe commit sequences.
- Restricted commit execution to explicitly approved groups only.
- Required all prompt-driven chat output to remain in English.

## Why it changed
- Provide a repeatable repository-local commit workflow similar to the existing review prompts.
- Improve commit quality by enforcing coherent grouping, clearer conventional commit messages, and user confirmation before destructive or history-changing actions.
- Reduce the risk of fragile commit ordering by handling dependency loops explicitly.

## Validation performed
- Reviewed the existing `.github/prompts/` structure and aligned the new prompt with repository-local slash-command conventions.
- Verified the prompt covers untracked files, staged and unstaged changes, conventional commit grouping, breaking-change handling, and per-group user approval.
- Verified `CONTRIBUTING.md` now references the repository-local `/commit` workflow in the commit guidance section.
- Confirmed all new file content is written in English.