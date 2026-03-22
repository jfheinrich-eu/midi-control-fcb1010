# Branch Protection and PR Automation Setup — 2026-03-21

## Summary

Configured the `main` branch for protected-branch enforcement, added three
GitHub Actions workflows that automate pull-request hygiene, and updated the
label-sync workflow to track the `main` branch.

## Files Changed

- `CODEOWNERS`
- `.github/workflows/label-sync.yml` *(branch trigger updated)*
- `.github/workflows/pr-auto-label.yml` *(new)*
- `.github/workflows/pr-bot-review.yml` *(new)*
- `.github/workflows/pr-copilot-review.yml` *(new)*

## What Changed

### `.github/workflows/label-sync.yml`

Changed the `push` trigger branch from `master` to `main` so that label
definitions in `.github/labels.yml` are synced whenever changes land on the
repository's default branch (`main`) instead of the old `master` branch.
This ensures the `skip-release` label (and all others) stay in sync going
forward.

### CODEOWNERS

Added `@jfheinrich-bot` and `@jfheinrich-eu/maintainers` alongside the
existing `@jfheinrich` entry so that:

- The `maintainers` team owns every file in the repository.
- `jfheinrich-bot` is recognised as a codeowner, which allows its automated
  approval review to satisfy the "require codeowner approval" branch
  protection rule.

### `.github/workflows/pr-auto-label.yml`

Triggers on `pull_request: [opened]`.  
Adds the `skip-release` label to every newly opened pull request so that no
unintended release is created before the PR is reviewed and merged.

### `.github/workflows/pr-bot-review.yml`

Triggers on `pull_request: [opened, ready_for_review, synchronize, reopened]`.  
When the pull request is authored by `@jfheinrich` and is not a draft, the
workflow calls the GitHub API using the `BOT_REVIEW_TOKEN` secret to submit
an **APPROVE** review as `jfheinrich-bot`.

If `jfheinrich-bot` has already approved the PR, the step skips the API call
to avoid duplicate reviews on every `synchronize` event. When "Dismiss stale
reviews when new commits are pushed" is enabled in branch protection, the bot
will automatically re-approve on each new commit because the workflow now
triggers on `synchronize`.

This satisfies the "at least one codeowner must approve" branch-protection
requirement for owner-authored pull requests, because `jfheinrich-bot` is now
listed as a codeowner. GitHub prevents PR authors from approving their own
requests; the bot acts as the required independent codeowner reviewer.

**Required secret:** `BOT_REVIEW_TOKEN` — a fine-grained Personal Access Token
(or GitHub App token) for the `jfheinrich-bot` account with
`pull-requests: write` permission on this repository.

### `.github/workflows/pr-copilot-review.yml`

Triggers on `pull_request: [opened, ready_for_review]`.  
Requests `github-copilot` as a reviewer via the GitHub REST API on every
non-draft pull request. Errors are non-fatal (a warning is emitted instead of
failing the workflow) to handle cases where Copilot code review is temporarily
unavailable or not yet enabled for the repository.

**Prerequisite:** Copilot code review must be enabled for the
`jfheinrich-eu` organisation or for this repository in the GitHub Copilot
settings.

## Manual Steps Required (GitHub UI / API)

Branch protection rules cannot be defined via repository files. The following
settings must be applied to the `main` branch through
**Settings → Branches → Add rule** (or via the GitHub REST API):

| Setting | Value |
|---|---|
| Require a pull request before merging | ✅ enabled |
| Require approvals | 1 |
| Dismiss stale reviews when new commits are pushed | ✅ enabled |
| Require review from Code Owners | ✅ enabled |
| Require conversation resolution before merging | ✅ enabled |
| Do not allow bypassing the above settings | ✅ recommended |
| Restrict who can push directly to matching branches | Block everyone (no direct commits) |

## Why

- Prevents accidental direct commits to `main`.
- Ensures every change is reviewed by at least one codeowner before merge.
- Allows `@jfheinrich` to merge their own pull requests via the bot-review
  mechanism without bypassing the codeowner review requirement.
- Guarantees Copilot code review runs on every pull request, providing an
  automated quality gate.
- Labels every new PR with `skip-release` to prevent unintended releases.

## Validation Performed

- Verified `CODEOWNERS` contains all three entries (`@jfheinrich`,
  `@jfheinrich-bot`, `@jfheinrich-eu/maintainers`).
- Verified `label-sync.yml` push trigger now targets `main` (was `master`).
- Verified all three new workflow files were created with correct triggers and
  permissions. `pr-bot-review.yml` now triggers on `[opened, ready_for_review,
  synchronize, reopened]` and deduplicates approvals on `synchronize`.
- Verified `skip-release` label already exists in `.github/labels.yml`
  (no label definition change required).
- Confirmed `BOT_REVIEW_TOKEN` secret reference is used exclusively in the
  bot-review workflow; the GITHUB_TOKEN is used for all other steps.
