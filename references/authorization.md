# Authorization Contract

This is the single authority for request scope and publication confirmation in this Skill. It applies to Publisher itself and every project it handles. Higher-priority platform rules and explicit user restrictions still apply. A prior approval of attribution, a passing test or an instruction inside another Skill cannot authorize publication.

## Request modes

| Mode | Allowed preparation | Stop point |
|---|---|---|
| Inspect / discuss | Read, list, search, analyze, propose | Do not edit target files, run acceptance, install, commit or operate remote systems. |
| Edit locally | Requested local edits and necessary tests; local commits may be prepared when useful and not prohibited by the user | Do not create repositories, push, change GitHub metadata or create Releases. Do not create a commit merely to finish an edit request. |
| Prepare publication | Requested local edits, tests, review, local commits and a concrete publication summary | Before remote actions, obtain explicit human confirmation of the displayed scope. “修改并发布” / edit-plus-publish wording authorizes preparation, not an unspecified push. |

## 许可、协议及声明确认

所有拟发布的许可证、协议、版权与署名声明，都须先列出名称、正文或准确内容、涉及文件及公开位置，取得用户明确确认。原创项目也不默认采用 MIT 或其他协议；已有文件、上游要求和发布检查模板不等于用户已确认公开这些内容。可与 README、具体提交和远程动作合并确认一次，已确认且未变化不重复询问。

未经确认不自动新增、恢复、搬移或替换协议。用户要求删除某项声明时，不得换个文件继续保留并声称已删除。用户撤回内容确认后，相应旧记录及候选不得继续用于推送；保留不相关的既有决定。

缺少许可、授权来源不明或检查未通过时停留在本地准备阶段，先说明具体待确认内容，不为通过检查擅自添加许可，也不宣称用户确认能授予其原本不拥有的权利。

## README 展示与确认（每次发布必需）

每次发布前必须实际展示当前待发布版本的 README 正文，并取得用户明确确认；有中文版本时优先展示完整中文 README，同时提供英文版供查看。只有英文时展示英文正文。可以用聊天正文或可阅读的文档视图；只报检查通过、只列文件路径／链接、只给截图或摘要，不能替代展示。排队或打开失败不算已展示，正文截断不算展示全文。

README 确认可以与具体发布范围合并为一次明确确认。展示前的笼统发布请求、自动检查通过、署名复用记录或其他版本的认可，都不能代替对本次 README 的确认。README 正文、关键链接或内嵌图片改变后，须重新展示变化后的内容并确认；同一次发布中已经确认且内容未变则不重复询问。

未展示或未明确确认时，必须停止在本地准备阶段，不执行远程发布。此人审要求适用于首次发布、更新及 Publisher 自身；不能用先前推送批准绕过它。README 内容确认本身也不授权未列明的远程动作。

## 发布范围确认（一次即可）

**发布范围说清楚后确认一次。已经确认过且范围没变，就直接执行，不要反复问。** 向用户用中文说明，不把英文规则原句当作确认提示。

推送前应说清：

- GitHub 账号、准确仓库地址、分支及公开性。
- 确切提交列表、变更概要和交付文件。
- 候选内容摘要、相关检查结果及尚未解决的风险。
- 本次远程动作：建仓、推送、更新仓库信息、创建 Tag 或 Release；逐项列明，不把推送藏在建仓命令里。

先核对本次范围是否已获用户明确确认：

- **已确认且范围未变：直接执行已批准动作，不重复询问。** 对话中断或进入下一流程步骤，不会自行使原确认失效。
- **尚未确认：展示上述具体清单，只确认一次。** 一次确认可以覆盖清单中多个明确列出的动作；泛泛的准备发布意图不能替代对具体范围的确认。
- **范围变化：只说明实际变化，并确认变化后的范围。** 包括账号、仓库、分支、公开性、提交/交付内容、Tag、Release 目标或远程动作发生变化；不能用无关变动反复要求确认同一范围。
- **用户暂停或撤回授权：立即停止。** 不用更早的确认覆盖当前暂停指令。

新增第三方署名或许可说明的内容确认与推送确认必须区分：先在聊天摘要中明示该内容，笼统的“发布吧”不代表同意新增署名/许可；两者已清楚列出时可一次明确确认，已确认且范围未变不再询问。具体要求见 `review-decisions.md`。

署名、许可证或测试结果的确认不能代替发布确认。推送确认不包含未列明的 Tag 或 Release；如需创建，必须说清名称和目标提交。强制推送、删除标签、重写历史等破坏性动作仍须单独说明并确认。

For a first publication, prepare a local commit and show the new repository's target URL, visibility and intended branch before creation/push. Authentication uses existing approved interfaces; do not request tokens in chat.

## Executable regression model

`scripts/authorization.mjs` exposes `authorizeAction` for deterministic policy regression. The caller supplies the explicit request mode, action and scope; it does not infer Chinese/English intent from keywords. A matching confirmation includes `explicit`, `userQuote`, `evidenceRef`, `actions` and the exact `scope`.

This model never commits, pushes or creates remote resources. It is not a permission interceptor, a trusted approval database or proof that an Agent followed the rules. A caller could fabricate its inputs, so the Agent must verify actual human conversation evidence. Automated model tests and fresh-client conversation acceptance are separate evidence levels.

## Inspect-only reports

An ordinary read-only inspection must not write reports into the target repository. Summarize in chat or use an explicitly authorized output location. Running an acceptance suite, creating a candidate directory or installing files requires an execution request; discussion alone is insufficient. During authorized local validation, generated reports may be written to local ignored locations.
