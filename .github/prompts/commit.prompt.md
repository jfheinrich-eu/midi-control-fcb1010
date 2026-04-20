---
description: "Interactive conventional commit workflow: stages selected untracked files, groups all changes into logical commits, previews the plan, and executes after user approval. Use when: committing changes, staging files, creating commits, conventional commits, git commit."
agent: agent
---

# Conventional Commit Workflow

Perform the following steps in order. Do not skip any step. Do not execute any `git commit` command until the user has explicitly approved the complete plan in Step 4.

---

## Step 1 — Discover Changed Files

Run `git status --porcelain` and collect:

- **Modified/deleted tracked files**: lines starting with ` M`, `M `, `MM`, ` D`, `D `, `R `, `A `.
- **Untracked files**: lines starting with `??`.

Display both lists clearly to the user.

---

## Step 2 — Resolve Untracked Files

If there are **untracked files**:

- List every untracked file with a short one-line description of what it appears to be (infer from path and extension).
- Ask the user: **"Which of these untracked files should be included in this commit? (list numbers, 'all', or 'none')"**
- Wait for the user's answer.
- Mark the selected untracked files as **to be staged**.

If there are **no untracked files**, skip this step and continue.

---

## Step 3 — Build the Commit Plan

Group all files (modified tracked + selected untracked) into **logical, self-contained commit groups**.

### Grouping principles

Each group must represent a single coherent change. Never mix unrelated concerns in one commit. Apply these rules:

| Files | Conventional Commit type | Scope example |
|---|---|---|
| Main driver script (`*.js`) — bug fix | `fix` | `driver` |
| Main driver script (`*.js`) — refactor, cleanup | `refactor` | `driver` |
| Main driver script (`*.js`) — new feature | `feat` | `driver` |
| `docs/*.md` | `docs` | _(omit scope or use topic)_ |
| `README.md`, `CHANGELOG.md` | `docs` | _(omit scope)_ |
| `.github/workflows/` | `ci` | workflow filename without extension |
| `.github/prompts/`, `.github/instructions/` | `chore` | `prompts` |
| `.github/copilot-instructions.md` | `chore` | `copilot` |
| `.github/PULL_REQUEST_TEMPLATE.md`, `.github/ISSUE_TEMPLATE/` | `chore` | `github` |
| `.github/labels.yml` | `chore` | `labels` |
| Root config files (`.gitignore`, `.editorconfig`, `.gitattributes`) | `chore` | `config` |
| `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `SUPPORT.md` | `docs` | `governance` |
| Mixed workflow infrastructure (multiple `.github/` files) | `chore` | `github` |

### Conventional commit message rules

- Format: `<type>(<scope>): <description>`
- Scope is optional — omit if it adds no value.
- `<description>`: imperative mood, lowercase, no trailing period, ≤72 characters total.
- If a fix closes a known issue or resolves a review finding, add a body line: `Closes #<n>` or `Resolves review finding <ID>`.
- If a change is breaking, append `!` after type/scope: `refactor(driver)!: rename smoothing to historyWeight`.

---

## Step 4 — Present the Plan and Ask for Approval

Present the complete commit plan as a numbered table:

```
Commit plan
───────────────────────────────────────────────────────
#1  fix(driver): remove competing stop-lamp callback
    Files: Behringer_BehringerFCB1010UnO2.js

#2  ci: pin all workflow actions to SHA
    Files: .github/workflows/pr-auto-label.yml
           .github/workflows/pr-bot-review.yml
           .github/workflows/pr-copilot-review.yml
           .github/workflows/label-sync.yml

#3  docs: document review fixes
    Files: docs/2026-03-25-review-fixes.md
           CHANGELOG.md
───────────────────────────────────────────────────────
```

Then ask:
> **Shall I proceed with these commits?**
> Reply `yes` to execute, `no` to abort, or describe any changes you want made to the plan.

Wait for the user's response before doing anything.

- If the user says **yes**: proceed to Step 5.
- If the user says **no**: stop and confirm aborted.
- If the user requests changes: adjust the plan and present it again (repeat Step 4).

---

## Step 5 — Execute the Commits

For **each commit group** in the approved plan, in order:

1. Stage exactly the files in that group:
   - For files already tracked and modified: `git add <file> [<file> ...]`
   - For untracked files selected in Step 2: `git add <file> [<file> ...]`
   - Stage **only the files in this group** — do not use `git add -A` or `git add .`.

2. Commit with the exact approved message:
   ```
   git commit -m "<type>(<scope>): <description>"
   ```
   If a body is needed (breaking change, closes issue), use:
   ```
   git commit -m "<type>(<scope>): <description>" -m "<body>"
   ```

3. After each commit, confirm success by showing the one-line `git log --oneline -1` output.

After all commits are done, run `git log --oneline -10` and show the result as a final summary.