# Update Workflow

For identity/attribution confirmation, [review-decisions.md](review-decisions.md) takes precedence over blanket “ask the user” instructions below: reuse unchanged scoped explicit approvals and ask only about new/changed findings. Reuse is not publication authorization; a current publication hold must be respected.

Use this for later updates to an existing skill repository.

## Short update process

Use [pre-publish-flow.md](pre-publish-flow.md) as the routing authority.

```text
Inspect request/diff → Relevant checks → Account and exact-scope summary → Explicit confirmation → Push approved actions → Verify
```

- Change only what the update requires. If public behavior, dependencies, install instructions or outputs change, update the affected documentation and run affected native checks. A satisfactory README and an unchanged approved preview do not need rewriting or regeneration on every update.
- Preserve project-required tests/CI and known applicable blockers. Check delivery/tracked content for secrets/private files and material rights/identity issues; use scoped prior decisions for unchanged findings.
- Do not run Publisher's smoke on other projects. Its engineering scorer, full candidate installation, client matrices, performance/Token evaluation and repeated A/B tests are optional subprocesses, selected only under the trigger rules in pre-publish-flow.
- An existing required acceptance failure must be resolved or reported; do not reclassify it to skip work. Reuse valid unchanged evidence and rerun only affected checks after an edit.
- Show one concise final summary: account, repository URL, branch, visibility, exact commits/change summaries, candidate digest, actions, relevant results and material limits. Wait under [authorization.md](authorization.md); scope changes require renewed confirmation. Push permission excludes an unlisted tag/Release.
- After authorized remote execution, verify the actual result. No publication follows from local edit/inspection permission.

## Common update types

```text
README update
Security patch
Skill trigger update
Template update
Reference docs update
Script hardening
Release prep
Dependency audit
Sensitive-data redaction
```

## Commit messages

Use concise imperative messages:

```text
Improve bilingual README
Harden helper script paths
Add trigger governance docs
Update publish checklist
```

## Discussion-first rule

Follow [authorization.md](authorization.md) as the single authority. Discuss/inspect means read-only, including no acceptance installs or target report writes. Edit-only means local changes and relevant validation, never remote writes. An explicit request to publish authorizes preparation and final review; it does not waive the concrete push checkpoint. Show exact repository, branch, commits/change summaries and actions, then wait for explicit confirmation. Reuse only the same unchanged confirmed scope. Push-only approval does not authorize a Release.

发布前按 `authorization.md` 实际展示本次 README 正文并取得明确确认；可与发布范围合并确认，同一次发布内容未变不重复询问。
