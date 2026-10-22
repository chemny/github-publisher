# GitHub Publishing Workflow

Use this for first-time publishing.

## Before publishing

Use [pre-publish-flow.md](pre-publish-flow.md) for the short default, including the necessary safety, documentation and change-scoped native checks. First publication may require preparing missing README, license, preview or installation facts; read only the relevant detailed guidance. Keep the actual project layout; only a Skill uses the single-Skill root convention. Preserve an existing license rather than replacing it by default.

Engineering scores, performance/Token evaluation, full fresh-install acceptance and all-client/OS tests are not automatically required. Select extra work only for a concrete trigger, within authorization; do not waive applicable project-required gates or claim untested support.

Before remote creation or push, show account, repository URL, branch, visibility, exact commits/change summaries, candidate digest, actions and relevant check outcomes. Obtain explicit confirmation under [authorization.md](authorization.md). Reuse only unchanged confirmed scope; a hold overrides approval. A tag/Release requires its own listed action and target.

## Authentication

Prefer GitHub CLI browser/device login:

```bash
gh auth login
```

Do not ask the user to paste a token into chat.

If browser/device flow is used, guide the user through:

```text
GitHub.com
HTTPS
Authenticate Git: yes
Login with browser/device code
```

## Create and push

Only after confirmation explicitly covers both repository creation and push, for a new public repository:

```bash
gh repo create <repo-name> --public --source=. --remote=origin --push
```

Set or update the repository description:

```bash
gh repo edit <owner>/<repo> --description "<one-sentence English repository description>"
```

For an existing empty repository:

```bash
git remote add origin <repo-url>
git push -u origin main
```

## Verify

After push:

```bash
git status --short
git remote -v
git log --oneline -1
gh repo view <owner>/<repo> --json url,visibility,defaultBranchRef,description
```

Return the GitHub URL to the user.
