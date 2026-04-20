---
description: "Interactive commit planner and executor for this repository. Use when: reviewing untracked files, grouping changes into conventional commits, proposing commit messages, checking breaking changes, and optionally creating commits after explicit user approval."
agent: agent
---

# Commit

Perform an interactive, robust commit workflow for the current repository.

All chat messages, questions, summaries, commit proposals, and commit bodies must be written in English.

Primary goals:
- Detect untracked files that are not ignored and let the user decide whether each should be added, removed, or added to `.gitignore`.
- Analyze all changed files, whether staged or unstaged, and organize them into logical commit groups using conventional commit types.
- Prepare one commit task per group with a conventional commit message, a short description header, and a brief body.
- Determine whether each commit is breaking. If that cannot be inferred with high confidence, ask the user once for the affected group.
- Show the proposed groups and commits to the user and let the user edit, accept, or cancel each commit.
- Only create commits after explicit user approval for the specific group.

## Guardrails

- Be robust and conservative. Do not guess when repository state is unclear.
- Never create a commit, stage files, delete files, or edit `.gitignore` without explicit user approval for that action.
- Avoid loop dependencies in commit planning:
  - If two candidate groups depend on each other in both directions, merge them into a single commit instead of forcing an order.
  - If documentation is required to keep a code change understandable or complete, keep the docs with that code commit.
  - If a pure refactor enables a later behavior change and can stand alone safely, place the refactor commit first.
- Prefer fewer coherent commits over many fragile ones.
- Never mix unrelated change types when a clean separation is possible.
- If there are no non-ignored untracked files and no modified files, report that there is nothing to commit and stop.
- If there are ignored untracked files only, do not ask about them.
- If the repository already has staged files, include them in the analysis instead of assuming the index is authoritative.

## Required Workflow

### 1. Inspect Repository State

Gather enough context to make a safe plan:
- Identify non-ignored untracked files.
- Identify modified, deleted, renamed, and staged files.
- Review diffs or file content as needed to understand intent and dependencies.
- Check whether `.gitignore` exists before proposing ignore changes.

### 2. Resolve Non-Ignored Untracked Files

If non-ignored untracked files exist, present them in a compact table and ask the user what should happen to each file.

Allowed actions per file:
- Add
- Remove
- Add to `.gitignore`
- Leave untouched for now

Rules:
- Ask in one consolidated interaction when practical.
- If the user chooses `Add to .gitignore`, propose the narrowest safe ignore pattern and ask for approval before editing `.gitignore`.
- If the user chooses `Remove`, ask for confirmation before deleting the file.
- After approved ignore or deletion actions, refresh repository state once before grouping commits.
- Do not repeat the same question unless repository state changed.

### 3. Build Commit Groups

Group all remaining changed files, staged or unstaged, into logical commits.

Use conventional commit types where applicable:
- `feat`
- `fix`
- `refactor`
- `docs`
- `test`
- `build`
- `ci`
- `chore`
- `perf`
- `revert`

Grouping rules:
- Group by intent, not by staging state.
- Keep atomic changes together.
- Keep required documentation with the behavior or interface change it documents when splitting would create dependency loops.
- Separate unrelated docs-only cleanup into `docs` commits.
- Prefer `refactor` over `chore` for code restructuring with no behavior change.
- Prefer `fix` or `feat` when behavior changes are user-visible.
- Include file lists and a one-sentence rationale for each group.

### 4. Draft Commit Messages

For each proposed group, create:
- A conventional commit header in the form `<type>(<optional-scope>): <short description>`
- A brief body with one or two bullet points describing what changed and why
- A breaking-change assessment

Breaking-change rules:
- Mark as breaking only if there is a real external behavior, API, interface, workflow, or configuration break.
- If the change is breaking, append `!` to the type or scope and include a `BREAKING CHANGE:` paragraph in the body.
- If breaking status is unclear, ask the user a targeted question for that group before finalizing the header.
- Do not overuse breaking markers for internal refactors.

### 5. User Review And Approval

Show the user all proposed commit groups in a clear review format.

For each group, include:
- Group number
- Proposed commit header
- Breaking status
- Files included
- Rationale
- Brief body

Then let the user choose, for each group:
- Accept
- Edit
- Cancel

Rules:
- Support editing of header, body, grouping, and breaking status.
- If the user edits grouping in a way that creates a dependency loop or invalid split, explain the problem and propose the smallest safe adjustment.
- If a group is canceled, exclude it from commit execution and leave its files untouched.
- Do not commit any accepted group until the user has explicitly approved execution.

### 6. Execute Approved Commits

Only after the user explicitly requests execution:
- Stage only the files belonging to the approved group.
- Re-check the diff for that group before committing.
- Create the commit with the finalized conventional commit message.
- Continue group by group in dependency-safe order.
- If a commit fails, stop, report the exact reason, and do not continue automatically.

After each successful commit, report:
- The created commit header
- The files included
- Whether more approved groups remain

## Recommended Interaction Pattern

Use this sequence unless repository state makes a different order safer:

1. Summarize current git state.
2. Resolve non-ignored untracked files.
3. Present proposed commit groups.
4. Collect user edits or approvals.
5. Execute only the approved commits.

## Output Format For Commit Proposals

Use a compact, reviewable structure such as:

```text
Group 1
Header: refactor(layout): extract label helpers
Breaking: no
Files:
- path/to/file
- path/to/other-file
Why:
- Separates UI label construction from surface setup without changing behavior.
Body:
- Extract pedal and footswitch label creation helpers.
- Reduce createSurface responsibility and keep layout behavior unchanged.

Group 2
Header: docs(development): document commit workflow
Breaking: no
Files:
- path/to/file
Why:
- Documents the new contributor workflow for repository-local slash commands.
Body:
- Add repository change note for the new /commit prompt.
```

## Success Criteria

The workflow is complete only when one of these states is reached:
- The repository has no actionable changes.
- The user reviewed the proposed commits and canceled execution.
- The approved commits were created successfully.

At the end, provide a concise summary of:
- Untracked-file decisions
- Final commit groups
- Commits created, skipped, or canceled