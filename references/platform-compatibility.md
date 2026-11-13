# Platform Compatibility

Select this subprocess under [pre-publish-flow.md](pre-publish-flow.md) when platform-sensitive behavior or support claims change, or the user/project requires it. For an ordinary documentation update, preserve the existing tested/untested boundary without automatically running a platform matrix. The scope below applies only to the platforms actually claimed or selected; do not add new compatibility promises.

For a Skill claiming both clients, the review targets are:

```text
Codex
Claude Code
```

Select only claimed/affected clients. Other clients require a relevant project claim or explicit user request.

## Skill 发布最低标准

- 所有经本流程发布的 Skill 均须面向 Windows 和 macOS 开箱即用：完成有说明的安装、必要依赖和账号配置后，可以加载并完成代表性核心任务，不要求用户修代码、修改硬编码路径或寻找未交付的私有文件。
- Windows／macOS 至少一端经过实际安装、加载及代表性核心任务测试；另一端完成兼容审查和必要适配，可以不实测。仅静态阅读两个系统都不满足要求。
- 另一端审查须覆盖实际安装入口、路径与大小写、Shell 命令、运行时及外部依赖、权限、编码和平台专属能力；发现差异须补齐可用的适配或替代路径。已知阻断核心任务的问题，或缺少必要审查／适配，须先处理，不能以“未实测”标签代替处理。
- 已知 Windows 故障按原因选择验证路径：代码兼容故障须针对原问题在 Windows 上验证修复，覆盖受影响的安装／加载／核心任务，原故障复现的有效记录可复用；Mac 测试通过、静态审查或模拟不能替代 Windows 修复验证。单纯缺少运行环境时，验证 Windows 下的环境检测、缺失提醒／安装引导及安装后复检路径，无需每次重新制造缺环境故障；安装仍须有对应授权。原因未明时先定位，不直接归为缺环境。缺少对应验证条件时记录为待验证，不宣称已解决或满足该问题的发布要求。未受影响的有效 Windows 证据可复用，不要求无关更新重跑。
- 静态审查不等于实测。内部报告分别记录实测系统及任务结果、另一端审查依据和适配、未实测范围与剩余问题；一端实测加另一端审查适配满足最低标准时，不因第二端未实测而额外要求确认。
- 未受改动影响且仍适用的验证证据可以复用，记录证据来源和适用范围；安装、依赖、路径或核心流程变化时，只补做受影响的验证。首次发布或缺少有效证据时补齐最低标准，不默认增加双系统实测或全客户端矩阵。
- 此最低标准针对 Skill，不强加给普通应用、CLI 或库。客户端范围仍按声明和受影响范围选择；Linux 默认可选，除非用户或项目明确要求。

## Goal

Confirm that installation, loading and core use work without hidden local assumptions. Apply the minimum above and keep actual execution separate from compatibility review; never infer runtime success from static review.

## Compatibility checks

- [ ] `SKILL.md` is at the repository root.
- [ ] `SKILL.md` uses valid YAML frontmatter.
- [ ] `name`, `description`, and trigger contexts are clear.
- [ ] Instructions do not depend on one platform's private memory files.
- [ ] Instructions do not depend on one platform's hidden runtime behavior.
- [ ] Installation docs use an Agent-directed installation request and do not make the user choose a platform directory.
- [ ] Platform-specific paths are examples only, not requirements.
- [ ] Any scripts use portable relative paths.
- [ ] Any scripts document runtime requirements such as Node.js, Python, `gh`, or shell tools.
- [ ] Network, filesystem, browser, email, Slack, Lark, GitHub, or other connector requirements are explicit.
- [ ] Dependencies on other skills are absent, optional, bundled, or documented.
- [ ] The skill can be installed without private user memory, local-only folders, or unpublished companion skills.
- [ ] Platform-specific capabilities are isolated in adapters or clearly marked sections.
- [ ] README includes a verification prompt that can be tried after a fresh session.
- [ ] macOS is explicitly considered when the skill uses scripts, installers, paths, shell commands, browser automation, filesystem operations, or external CLIs.
- [ ] Windows is explicitly considered when the skill uses scripts, installers, paths, shell commands, browser automation, filesystem operations, or external CLIs.
- [ ] Windows checks do not rely on POSIX-only tools such as `bash`, `sh`, `sed`, `grep`, `xargs`, `cp`, `mv`, `rm`, `chmod`, or Unix-only path assumptions unless an adapter or fallback is documented.
- [ ] Node.js scripts use `path.join`, `path.resolve`, `path.relative`, and `path.sep` instead of hardcoded `/` path assumptions for filesystem operations.
- [ ] External CLIs required on Windows, such as `git`, `node`, `python`, or `gh`, are documented and expected to be available in `PATH`.

## README compatibility and conditions

Follow [readme-style.md](readme-style.md): put reader-relevant support and minimum core runtime conditions in the Installation table before the install action, not in a separate top-level compatibility section. Keep detailed OS entry points and internal test status in the review or deeper documentation; surface a limitation only when it changes the ability to start. Optional integration environments are prepared on demand by the Agent.

README 只保留对用户有价值的安装、配置和使用信息，例如必要运行时、依赖、账号条件、平台专属操作或替代入口。不放“已实测／未实测”、验证矩阵、内部缺口、审核结论或测试日志，也不为了展示验证状态增加负面说明。实际条件须写清楚，不能省略影响使用的必要操作或宣称未经证实的全面兼容；核心阻断应在发布前处理。

Distinguish core dependencies, optional integrations and platform-specific capabilities. State required versions, account access or external services where they affect installation or use. Successful installation, CI or testing of one component does not establish support for every integration or OS.

For a collection, apply the root-level SKILL.md checks below to the actual component entry points and authorized collection layout; see [repo-structure.md](repo-structure.md).

## 内部报告格式

仅在内部发布报告中记录，不复制到 README：

```text
开箱即用：安装／加载／代表性核心任务的结果及证据
macOS：实测通过／审查适配完成（未实测）／未完成 — 环境、任务或审查范围、证据
Windows：实测通过／审查适配完成（未实测）／未完成 — 环境、任务或审查范围、证据
适配：实际差异、处理方式及依据
证据复用：来源、相关版本／内容、为何仍适用
剩余问题：无／具体缺口及发布阻断项
最低标准：满足／未满足及原因
```

至少一端须有实测通过证据，另一端至少审查适配完成；“未完成”或已知核心阻断不能算满足。额外选定的客户端、Linux 或全面验收结果单独如实记录，不能把这些项目未执行改写为通过。

README 可写明确可执行的使用条件，例如“创建仓库需要 GitHub CLI（`gh`）及已登录账号”；不要写“Works everywhere”或把“审查适配完成”说成“双系统实测通过”。
