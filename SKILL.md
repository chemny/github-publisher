---
name: github-publisher
description: Use when a user wants to publish or update a Skill or project on GitHub. Default to a short, change-scoped release flow; invoke engineering, performance or Token analysis only when requested or justified. 发布范围说清楚后确认一次；已经确认过且范围没变，就直接执行，不要反复问。
metadata:
  version: "0.1.0"
---

# GitHub Publisher

Help the user publish the requested project with proportionate checks and concrete authorization. Preserve useful existing structure and documentation.

## Default: short publication flow

Read `references/pre-publish-flow.md` for the default route: understand the request and diff → relevant release checks → show the pending README to the user (Chinese first when available) → show account, repository, branch, exact commits, candidate digest and actions → README 内容与发布范围均已明确确认后执行；同一次发布内容未变不重复询问 → execute only approved actions and verify. Read `references/authorization.md` for scope; reuse unchanged identity decisions under `references/review-decisions.md`, never as push permission.

快速发布须验证核心任务和 README 示例：首次发布、相关流程／示例变化或缺少有效证据时，实际跑通代表性核心任务，逐一验证可执行示例；自然语言同义示例可选代表项，展示素材核对来源与功能一致性。未变化且仍适用的有效证据可复用，验证状态只写内部报告。涉及真实副作用的验证使用预览／沙盒／模拟，不扩大授权；具体要求见 `references/pre-publish-flow.md`。

Do not automatically run engineering scores, performance/Token benchmarks, optimization, full acceptance, repeated model comparisons or all-platform checks. Do not rewrite a satisfactory README or regenerate an unchanged approved preview just to release. Existing project-required CI/tests and known blockers still apply.

Optional subprocesses require a concrete trigger. State the issue, affected scope, expected work/cost and stop point before starting; obtain missing authorization for execution or edits. Use existing session authorization when it already covers that scope. Return to the publication flow after the relevant result; do not chain unrelated subprocesses. Performance suspicion alone permits proposing a measurement, not an expensive benchmark.

## Skill 交付底线

发布的 Skill 须开箱即用：完成有说明的安装及必要依赖、账号配置后，能够加载并完成代表性核心任务，不要求用户修代码、改硬编码路径或寻找未交付的私有文件。Windows／macOS 至少一端有实际安装、加载和核心任务验证，另一端完成兼容审查及必要适配；审查不冒充实测。有效且未受改动影响的证据可复用，不默认重跑双系统或全客户端矩阵。验证状态、证据与缺口只写内部发布报告；README 只保留有助于安装、配置和使用的信息。详见 `references/skill-completeness.md` 和 `references/platform-compatibility.md`。

目标 Skill／项目在调用相关功能前须检测必要运行时及依赖；缺失或版本不符时提醒适合当前系统的安装方式，有授权才安装，完成后复检并验证受影响的最小任务。可选依赖按需检测，详见 `references/skill-completeness.md`。已知 Windows 故障须在 Windows 验证修复，不能用 Mac 通过或静态审查代替；无实测条件时保留为待验证，详见 `references/platform-compatibility.md`。

## 发布确认规则

### 许可、协议与版权声明（先确认，不默认添加）

- 所有拟公开的许可证、协议、版权及署名声明，均须先向用户列明内容与位置，取得明确确认后才能发布；包含原创项目的 MIT 等默认许可及随复用代码保留的声明。
- 未确认时不自动选择、生成、补回或替换许可；用户要求删除时，不得把相同声明转移到其他文件后声称已删除。
- 缺少许可或相关检查未通过时，保持本地准备状态并说明待确认项，不为通过检查擅自补写协议。内容确认不代表获得原本没有的代码授权。
- 用户撤回许可内容确认后，不沿用旧确认或旧候选推送。范围与内容均已明确确认且未变化时，不重复询问。

### README 展示与确认（发布前必做）

- 每次发布（首次、更新及发布 Publisher 自身）前，必须实际展示当前待发布版本的 README 正文，等待用户明确确认后才能发布。有中文版本时优先展示完整中文 README，并提供英文版供查看；只有英文时展示英文正文。
- 可以在聊天中展示正文，或打开可阅读的文档视图。仅报告“README 检查通过”、只列文件名／路径／链接、只展示截图或功能摘要，都不算完成 README 展示与确认。视图仍在排队、打开失败或正文截断时，不得声称用户已看到全文。
- README 内容确认可以与最终发布范围合并为一次明确确认，不能用展示 README 之前的笼统“发布吧”替代。确认 README 不等于授权未列明的推送、建仓、改名、Tag 或 Release。
- 同一次发布中，已展示且明确确认的 README 内容未变，不重复询问；正文、关键链接或内嵌图片变化后，须重新展示变化后的内容并取得确认。不能跨发布沿用其他版本的 README 确认。
- 自动检查、静态回归和署名复用记录不能代替用户对本次 README 的真实确认。未展示或未确认时停止在本地准备阶段。

发布范围说清楚后确认一次。已经确认过且范围没变，就直接执行，不要反复问。向用户用中文说明发布清单和确认要求，不直接引用英文规则。

范围包括账号、仓库、分支、公开性、确切提交/交付内容和远程动作。只有范围变化或用户暂停、撤回授权时，才停止并处理变化；需要重新确认时，只确认变化后的具体范围。内容署名确认不等于推送确认，推送确认不包含未列明的 Tag 或 Release。以 `references/authorization.md` 为准。

新增第三方署名或许可说明，须在聊天发布摘要中明确列出并取得内容确认；只放附件或笼统的“发布吧”不算。内容与推送可一次明确确认，已确认且未变化不重复询问。详见 `references/review-decisions.md`。

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

选择 Skill 全面诊断时，按 `references/project-analysis.md` 检查冗余规则、冲突规则、过度门禁、触发与范围、上下文加载、执行闭环、判断与证据这 7 类；局部诊断只查相关项。快速发布不默认执行整套检查，不因此增加评分或多轮对照。

For a diagnosis report use: purpose and boundaries; main flow with real components; evidence-backed findings ordered by impact; actual checks and their limits; practical next fixes; publication advice. Keep it proportionate and avoid repeating entire checklists. A score does not authorize publication or replace core task verification.
