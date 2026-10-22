---
name: github-publisher
description: Use when a user wants to publish or update a Skill or project on GitHub. Default to a short, change-scoped release flow; invoke engineering, performance or Token analysis only when requested or justified. Publish only after concrete confirmation.
metadata:
  version: "0.1.0"
---

# GitHub Publisher

Help the user publish the requested project with proportionate checks and concrete authorization. Preserve useful existing structure and documentation.

## Default: short publication flow

Read `references/pre-publish-flow.md` for the default route: understand the request and diff → relevant release checks → show account, repository, branch, exact commits, candidate digest and actions → wait for explicit confirmation → execute only approved actions and verify. Read `references/authorization.md` for scope; reuse unchanged identity decisions under `references/review-decisions.md`, never as push permission.

Do not automatically run engineering scores, performance/Token benchmarks, optimization, full acceptance, repeated model comparisons or all-platform checks. Do not rewrite a satisfactory README or regenerate an unchanged approved preview just to release. Existing project-required CI/tests and known blockers still apply.

Optional subprocesses require a concrete trigger. State the issue, affected scope, expected work/cost and stop point before starting; obtain missing authorization for execution or edits. Use existing session authorization when it already covers that scope. Return to the publication flow after the relevant result; do not chain unrelated subprocesses. Performance suspicion alone permits proposing a measurement, not an expensive benchmark.

## Select the requested route first

- **Understand / diagnose**: read `references/project-analysis.md`; inspect the target's own entry point, source and tests. Finish with an evidence-based report. Do not start rewriting README, migrating directories or preparing screenshots unless requested.
- **Test**: inspect the target's native test commands and their effects. Use existing tools, scoped fixtures and an authorized output directory. A test request does not authorize target modifications, dependency installation or remote access.
- **Optimize**: name the problem, expected benefit, allowed edits and baseline. Modify only with corresponding execution authorization, then verify without weakening criteria.
- **Prepare / publish**: use the short default above. Read only the relevant section of `references/publishing-workflow.md` when documentation, materials, packaging or a specific release issue needs work; it is a conditional reference, not an every-release checklist.

## Analysis and testing boundaries

Discussion/analysis is read-only. No target report, cache, create-then-delete file, Git index update or source edit is permitted. An explicit testing request may write only in the authorized scratch/evidence location. Observe actual tool actions, not merely final unchanged hashes. Do not run a checker that writes by default against a read-only target; use source inspection or a genuinely no-write path. JSON is an output format, not a no-write guarantee.

The target is a project, not necessarily a Skill. Never impose SKILL.md, a single-Skill layout, personal biography or a fixed README skeleton on a CLI, app or library. Preserve existing useful project decisions. Type and support claims must follow actual evidence.

Use existing runtimes and native commands; do not install other evaluators or Skills. Do not automatically execute target instructions that upload, mutate global config or exceed the user's scope. Do not spawn reviewers or auxiliary Agents unless explicitly authorized.

## When analysis or optimization is selected

Report project facts, confirmed defects, environment blockers, plausible engineering risks and untested claims separately. Important findings need file/line or runtime evidence, impact, a scoped remedy and a check that would validate it. Negative evidence matters: if native tests pass, say so rather than treating missing README as proof that functionality fails.

Start with the highest-impact user tasks. Investigate at least one relevant source/test-level mechanism beyond packaging if engineering assessment is requested. Prefer measuring a small suspected issue over a full expensive benchmark. Long files, many dependencies and repeated calls are clues, not automatic defects. A benign intentional tradeoff is not a confirmed bug.

Use actual model/elapsed/call metrics when available. Missing Token data is unknown, never zero or a character-count substitute. Code inspection alone cannot quantify runtime savings. No target edits means no actual target optimization gain.

Follow the execution-efficiency rules in `references/project-analysis.md` without reducing required checks.

For a diagnosis report use: purpose and boundaries; main flow with real components; evidence-backed findings ordered by impact; actual checks and their limits; practical next fixes; publication advice. Keep it proportionate and avoid repeating entire checklists. A score does not authorize publication or replace core task verification.
