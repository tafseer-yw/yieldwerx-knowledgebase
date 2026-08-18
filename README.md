# YieldWerx Knowledgebase

The YieldWerx Knowledgebase is the central, version-controlled source for YieldWerx
domain knowledge used by people, Claude, QA tools, and the PROBE process.

It keeps the original internal documents for traceability and provides a small,
AI-ready Markdown file for every handbook chapter and appendix. An agent can read one
relevant chapter instead of loading the complete handbook.

## Why this repository exists

- Give the company one shared place for YieldWerx domain knowledge.
- Keep product answers consistent across teams and projects.
- Let Claude and other agents load only the knowledge needed for a question.
- Keep every answer traceable to an approved source.
- Update knowledge independently from any test automation framework.

## What is included

- The current Third Edition handbook and archived First and Second Editions.
- Supporting internal guides and training documents.
- 27 generated Markdown files: one per chapter, appendix, or handbook section.
- A compact QA domain map.
- A Claude Code marketplace plugin.
- Portable skill packages for Claude web and desktop.
- Source hashes, validation, ownership, and an Azure pipeline.

## Repository layout

```text
.
├── .claude-plugin/marketplace.json
├── catalog/sources.json
├── docs/
├── plugins/yieldwerx-knowledgebase/
│   ├── .claude-plugin/plugin.json
│   └── skills/
│       ├── ask-yieldwerx/
│       │   ├── SKILL.md
│       │   └── references/
│       │       ├── INDEX.md
│       │       ├── domain-map.md
│       │       └── handbook/       # one Markdown file per chapter
│       └── update-yieldwerx-knowledge/
├── scripts/
└── sources/
    ├── current/
    ├── archive/
    └── support/
```

## Source authority

Use this order when sources disagree:

<!-- BEGIN GENERATED: authority order (node scripts/render-authority.mjs) -->

1. Approved feature specification or durable product decision.
2. Current YieldWerx Domain Handbook.
3. Supporting product and training material.
4. Archived handbook editions.

<!-- END GENERATED -->

The handbook does not override a newer approved product decision. A conflict must be
reported and then corrected in this repository.

## Skill: `ask-yieldwerx`

### Why

It gives simple and consistent domain answers without loading the complete handbook.

### What

It routes a question to the smallest relevant chapter, explains the answer in plain
language, and cites the source section.

### When

Use it for YieldWerx terms, modules, workflows, calculations, reports, screens,
onboarding, PRDs, test cases, automation, and defects.

### Where

Its files are in
`plugins/yieldwerx-knowledgebase/skills/ask-yieldwerx/`. Topic routing is in
`references/INDEX.md`, and individual chapters are in `references/handbook/`.

### How

Claude reads the index, opens only the relevant chapter files, answers in simple
language, and marks unconfirmed behavior instead of guessing.

## Skill: `update-yieldwerx-knowledge`

### Why

It keeps new knowledge traceable and prevents a draft assumption from becoming a
company rule.

### What

It compares an approved source with current knowledge, updates only affected chapters,
and records source and history changes.

### When

Use it for an approved PRD, new handbook edition, confirmed product decision,
correction, or knowledge release.

### Where

Its instructions are in
`plugins/yieldwerx-knowledgebase/skills/update-yieldwerx-knowledge/`. Raw documents,
the source catalog, generated knowledge, and history remain in their root folders.

### How

It checks source authority, identifies affected chapters, makes narrow updates,
rebuilds the catalog, records the change, and runs validation before review.

## Use in Claude Code

This repository remains the source and independently versioned dependency for
YieldWerx knowledge. End users install the public `yw@yieldwerx` plugin and use:

```text
/yw:ask-yieldwerx
/yw:update-yieldwerx-knowledge
```

The `yw` plugin loads this knowledgebase as a dependency. Its internal skills
are hidden from the user-facing slash-command menu but remain available to the
`yw` adapters.

Knowledgebase maintainers can add and test this private marketplace directly:

```text
/plugin marketplace add https://github.com/tafseer-yw/yieldwerx-knowledgebase.git
/plugin install yieldwerx-knowledgebase@yieldwerx-company
```

GitHub uses the user’s existing Git credentials. For team-managed Claude Code,
an administrator can also add this marketplace in managed settings.

Test locally from the repository before publishing:

```powershell
claude plugin validate .
/plugin marketplace add .
/plugin install yieldwerx-knowledgebase@yieldwerx-company
```

## Use in Claude web or desktop

Build the upload packages:

```powershell
npm run package:skills
```

This creates one ZIP per skill in `dist/skills/`.

For a personal upload:

1. Open **Customize > Skills**.
2. Select **Create skill**, then **Upload a skill**.
3. Upload the required ZIP.
4. Enable the skill.

For company-wide use, a Claude Team or Enterprise owner enables Skills and code
execution, then provisions the ZIP from **Organization settings > Skills**. The
`ask-yieldwerx` ZIP includes its chapter files and works without access to this Git
repository. The update skill can propose changes in chat, but committing an update
still requires repository access and review. See
[`docs/CLAUDE-DISTRIBUTION.md`](docs/CLAUDE-DISTRIBUTION.md) for the rollout model and
official Claude references.

## Use with PROBE and test automation repositories

Keep PROBE, this knowledgebase, and test frameworks in separate repositories. Install
the PROBE plugin and this knowledge plugin in the same Claude environment. PROBE stays
framework-agnostic, while `ask-yieldwerx` supplies domain context only when a feature
needs it.

For non-Claude automation, clone both repositories as sibling folders or fetch a
versioned knowledgebase artifact in CI. Do not copy the knowledge files into every
framework; copied files become stale. See
[`docs/PROBE-INTEGRATION.md`](docs/PROBE-INTEGRATION.md).

## Update the handbook knowledge

1. Put the new approved source in `sources/current/`.
2. Move the replaced edition to `sources/archive/`.
3. Update the extractor section map if the handbook structure changed.
4. Run `npm run extract`.
5. Review only the changed chapter files.
6. Run `npm run catalog`.
7. Update `CHANGELOG.md`.
8. Bump the plugin version for a release.
9. Run `npm test`.
10. Open a pull request for the code owner.

## Validation

```powershell
npm test
claude plugin validate .
```

Large source documents use Git LFS. Install Git LFS before cloning or updating source
documents:

```powershell
git lfs install
```

## Ownership and confidentiality

This repository contains internal YieldWerx material. Do not publish it outside
approved YieldWerx systems. The current code owner is
`tafseer.haider@yieldwerx.com`. Configure the same identity as a required reviewer in
the GitHub branch protection rule for `main`.
