# GitHub Publisher

English | [中文](./README.zh.md)

## Overview

GitHub Publisher helps you turn a local Skill into a GitHub repository you can share: write bilingual READMEs, review publication readiness, address findings, then publish with your authorization and verify the result.

![Capability illustration: Skill preparation, pre-publication review, and GitHub publication; includes dependencies, compatibility, safety and rights checks](./assets/publisher-hero-v4.png)

It is for authors who have built a Skill and want to share it, with help organizing files, usage instructions and publication concerns. By default, each Skill has its own repository, with the Skill entry point at the repository root.

## Features

| Capability | What it helps you do |
|---|---|
| Analyze projects and engineering issues | Map a Skill or project's workflow, components and configuration; diagnose with source and native-test evidence, identify input provenance and disclose untested scope. |
| Organize a Skill repository | Identify the entry point, supporting files and dependencies; separate material to share from local drafts and caches. |
| Write bilingual READMEs | Understand the Skill's main purpose, then explain its features, installation, usage and structure so users know where to begin. |
| Check publication readiness | Locate missing files, broken links, image problems, sensitive information, and identity or rights questions that need review. |
| Publish to GitHub | Show the pending README for your approval, Chinese first when available, and confirm the concrete repository, branch, commits and actions before publishing; these approvals can be combined once. Then verify the result. Requires GitHub account access. |
| Validate a candidate installation | Build a local candidate directory, install its files into a separate directory and run native core tasks, with content digests and logs. Client loading and conversations remain separate checks. |
| Modify an existing Skill | Make the requested local changes and update affected descriptions; your instruction determines whether to publish. |
| Review engineering quality | Assess structure, reuse and robustness to prioritize improvements; a score does not prove tested functionality or readable copy. |

Project analysis follows the actual project type; ordinary projects do not need a Skill layout. The analysis workflow has local validation on a video-navigation Skill; other project types require their own acceptance. An analysis request does not automatically authorize edits or publication preparation.

## Installation

### Requirements

Use an Agent client that can read Skills and run local commands. Prepare the core tools first; GitHub login is needed only when you want to operate a GitHub repository.

| Item | Requirement |
|---|---|
| Agent client | For example, Codex or Claude Code; installation and loading depend on the client. |
| Node.js | Used by the check scripts; the project's check configuration uses version 22. |
| Git | Used to inspect file changes, repository state and commit history. |
| GitHub CLI (optional) | Use `gh` with an appropriately authorized account when operating GitHub repositories. |

The Agent checks the tools needed for your task before use, guides you through missing prerequisites, and verifies the environment after setup. Optional tools are prepared only when needed.

### Quick Installation

Send this request to the Agent you are using:

> Install this Skill for me: https://github.com/chemny/github-publisher . Check Node.js and Git first and prepare any missing core tools, then install the Skill and verify that the client can find and load it. Leave GitHub login until I need to publish.

When finished, ask the Agent to report the installation location, whether loading works, and any unmet requirements.

## Quick Start

After installation, open the folder of the Skill you want to share and check whether it is ready:

> Check this Skill and tell me what needs fixing before I publish it to GitHub.

## Usage Examples

### Prepare a Skill to share

> I've been using this Skill locally. Help me organize it into a repository suitable for GitHub.

### Make the README easy to understand

> Rewrite this Skill's English and Chinese READMEs so a first-time reader knows what it does and how to install and use it.

### Publish a prepared Skill

> Publish this Skill to my GitHub. Use the Skill's name for the repository and make it public.

### Modify and publish together

> Make the README's installation instructions clearer, then sync the changes to GitHub once the checks pass.

A request to modify files leads to local changes. An explicit request to modify and publish prepares the changes and checks, then shows the exact repository, branch, commits and remote actions for your confirmation before pushing. Push approval does not include creating a Release unless that action and target were listed. Sensitive information, failed applicable required checks, unresolved required acceptance, unsupported compatibility claims or an unclear target pause publication.

### Validate an installation before sharing

> Run the native local acceptance pilot for this Skill. Check the delivered files and core tasks, and tell me which client or behavior checks have not actually run. Do not publish.

The pilot uses existing Node.js and Git without external evaluation tools. It tests a candidate-directory installation; GitHub download installation and real client loading require separate verification.

### Check what should stay private

> Check this repository for keys, private paths and material whose rights need review.

### Choose improvements to tackle first

> Review this Skill's engineering quality. What is most worth improving first?

## How It Works

The default flow is short: understand the project and diff → run relevant release checks → show account, repository, branch, commits and exact actions → wait for your confirmation → publish and verify. Reuse satisfactory documentation and unchanged approved previews. Safety checks, existing project-required gates and concrete publication confirmation remain required.

Engineering diagnosis, performance/Token evaluation, optimization and full installation acceptance are optional subprocesses. Select them only when requested or a concrete issue/material delivery change calls for them. Explain scope, expected work and stop point, act within existing authorization and obtain any missing permission. Return to the publication flow without chaining unrelated checks. See the [short publication flow](./references/pre-publish-flow.md).

This is one standalone Skill, with no bundled sub-Skills. Its main components are:

| Component | Role |
|---|---|
| `SKILL.md` | The Agent entry point: work sequence, authorization and publication boundaries. |
| `references/` | Detailed guidance for writing, installation, visuals, compatibility, safety and publication checks. |
| `templates/` | Standard, Hero and Practical Tool READMEs, each in English and Chinese, for a regular introduction, a prominent opening presentation or a utility needing more scenarios. Also includes license, ignore-file and internal review-record templates. |
| `scripts/` | Static publication checks, native acceptance, an authorization regression model, engineering analysis and self-checks. |
| `evals/` | Document fixtures, an explicit candidate-delivery manifest and installed-tool task cases. |
| `examples/` | An approved README illustration case with reusable practices and product-specific choices clearly separated. |

Select these tools by task; this is not an every-release checklist:

- **Publication-readiness check**: inspects the current project's documentation, files, safety and Git state, producing `publish-check-report.json`. Results indicate a pass, required review or a blocker; the engineering-hygiene score is not permission to publish.
- **Native acceptance pilot**: produces `acceptance-report.json` and retained candidate/install directories with logs. It verifies delivered content and executes installed script tasks; when full acceptance is selected, client discovery, live Agent conversations and its required OS checks remain explicit manual requirements. Required failures, errors or unexpected skips block; unresolved review returns a separate status and does not permit publication. The temporary directories are not an OS/network sandbox.
- **Engineering-quality analysis**: produces `se-quality-report.json`, distinguishing directly verifiable items from advisory estimates. It supplements the publication check rather than replacing it.
- **Publisher self-check**: validates this Skill's supporting files, templates and check tools, producing `smoke-test-report.json`. It cannot prove that another Skill works; other projects still need their own tests.

During authorized validation, the check tools write local reports; inspect-only requests do not write into the target. The Agent follows the authorization contract for commits and remote actions. The regression model tests the policy, but cannot intercept another Agent's tool calls or prove that a conversation obeyed it. After automated checks, a person still needs to review product fit, examples, bilingual facts and the scope of visual evidence.

Attribution checks distinguish ordinary examples and known standard license text from unresolved credits, preserving source reasons. An explicitly supplied external confirmation record can close unchanged content findings for a candidate directory; changes invalidate that record. This does not approve Git history or publication. See [review decisions](./references/review-decisions.md).

## Repository Structure

```text
github-publisher/
├── SKILL.md                 # Agent entry point
├── references/              # Writing and publication guidance
├── templates/               # Three bilingual README styles and supporting templates
├── scripts/                 # Check tools and tests
├── evals/                   # Check cases
├── assets/                  # README capability illustration
├── examples/                # Approved illustration reference case
├── .github/workflows/       # Automated check configuration
├── .gitignore               # Local-file ignore rules
├── README.md                # English introduction
├── README.zh.md             # Chinese introduction
└── LICENSE                  # License
```

Installation needs `SKILL.md` and its referenced guidance, templates and tools, not just the entry file. Generated reports and `.publisher-pilot/` workspaces are not installation content: publication and engineering reports go into the project being checked; the Publisher self-check report goes into this Skill's directory.

Further reading: [README writing standard](./references/readme-style.md), [copy review method](./references/readme-review.md), [checker coverage](./references/readme-checks.md), [illustration reference case](./examples/readme-visual/publisher-capability.md), [GitHub workflow](./references/github-workflow.md), [authorization contract](./references/authorization.md), and [native acceptance and its limits](./references/acceptance.md).

## License

This project uses the [MIT License](./LICENSE). Referenced third-party materials, trademarks and upstream content remain subject to their own terms.

## About Me

Author: Neo, an independent developer focused on practical AI.

If you need help learning or applying AI, feel free to get in touch!
