# Skill Completeness And Dependency Check

Run this before publishing a new skill repository and before updating an already published skill repository.

## Goal

Confirm that the skill is complete enough to install and use, and that it does not silently depend on other private skills, local-only files, unpublished scripts, or hidden runtime state.

开箱即用的底线：完成有说明的安装和必要依赖、账号配置后，Skill 能被加载并完成代表性核心任务；用户无需修代码、改硬编码路径或寻找未交付的私有文件。依赖可存在，但须公开可获得、随包交付或有可用适配，且说明必要配置；安装依赖、修改环境仍须有对应授权。可选集成只在需要时准备。

交付中缺失的必需依赖、不可获得的私有文件或缺少可用安装路径的问题须在发布前解决，不能仅靠说明或确认视为可用。用户机器尚未安装公开可获得的运行时，不等于交付缺陷，但必须具备下述检测和引导。Windows／macOS 的最低验证和证据复用按 [platform-compatibility.md](platform-compatibility.md) 执行；验证状态只记内部报告，不搬进 README。

## Required files

- [ ] `SKILL.md` exists at the repository root.
- [ ] `SKILL.md` has valid YAML frontmatter.
- [ ] Frontmatter includes `name` and `description`.
- [ ] Version, when present, is read from `metadata.version`; legacy top-level `version` must be migrated before a publisher-managed release.
- [ ] `README.md` exists for public repositories.
- [ ] `README.zh.md` exists when bilingual publishing is required.
- [ ] `LICENSE` exists.
- [ ] `.gitignore` exists when generated files, build output, local caches, or package managers may appear.

## Skill logic completeness

- [ ] The skill states when to use it.
- [ ] The skill states what it should not be used for when that matters.
- [ ] Required references listed in `SKILL.md` actually exist.
- [ ] Templates listed in `SKILL.md` actually exist.
- [ ] Scripts listed in `SKILL.md` actually exist and are executable or documented.
- [ ] Relative paths in instructions resolve from the skill root.
- [ ] The skill can still provide value if optional references, scripts, or adapters are not used.

## Dependency check

Look for hard dependencies on:

- [ ] Other skills by name.
- [ ] Private local paths.
- [ ] User memory files.
- [ ] Host-specific config files.
- [ ] Local databases, caches, logs, or session files.
- [ ] Specific tools such as `gh`, Node.js, Python, browser automation, Slack, Gmail, Lark, or other connectors.
- [ ] Network services, API keys, cloud accounts, or private endpoints.

For every dependency, classify it:

```text
required       must be installed or available for the skill to work
optional       improves workflow but the skill still works without it
adapter-only   isolated to a platform or integration adapter
private        must not be published as-is
```

## Dependency handling

- [ ] Required public dependencies are documented in README and `SKILL.md`.
- [ ] Optional dependencies are clearly marked optional.
- [ ] Adapter-only dependencies are isolated in adapter sections or files.
- [ ] Private dependencies are removed, replaced, or documented as unsupported before publishing.
- [ ] The user is told before publishing if a dependency cannot be bundled, documented, or removed.

## 运行前环境检测与安装引导

- 发布前检查目标 Skill／项目是否具备以下检测、提醒和复检路径，不能仅在 README 列出依赖就算完成；只检查当前任务需要的环境，可选功能的依赖按需检测。
- 在调用相关功能前，检测必需的 Python、Node.js、包依赖及外部工具是否可用、版本是否符合项目要求，并使用当前系统实际可用的入口；不能只凭命令存在就认定环境可用。同一会话中，环境及相关依赖未变化且检测结果仍适用时，复用已有结果，不逐步重复检测；安装或调整依赖、切换运行环境、出现相关错误后，重新检测受影响项。
- 缺失或版本不符时，在使用前明确提醒用户缺少什么、用于什么，并给出适合当前 Windows／macOS 的安装或升级方式。安装、升级或修改环境须有对应授权；已有同范围授权可复用，不自动安装，也不因可选依赖缺失阻断无关功能。
- 安装或调整完成后，重新检测实际调用的入口、版本和必要依赖，再验证受影响的最小核心任务；未通过时不继续依赖该环境的操作、不宣称配置成功。用户不安装或无法完成配置时，说明所需下一步或可用替代路径并停止受影响任务。
- 检测及复检的状态、证据和缺口只写内部报告；README 可保留有助于安装和使用的运行时要求、安装指引及必要配置，不放内部验证状态。开箱即用允许有必要环境配置，但不能要求用户自行排查报错、修代码或改硬编码路径。

## Pre-publish report

Report the result before publishing:

```text
Completeness:
- Required files: pass/fail
- Missing references/templates/scripts: none / [list]
- Hard dependencies: none / [list]
- Private or local-only dependencies: none / [list]
- Required fixes before publish: none / [list]
```
