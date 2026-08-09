---
name: ask-yieldwerx
description: Answers YieldWerx product, semiconductor, module, workflow, data, calculation, reporting, UI, and QA domain questions from the approved internal knowledge files. Use when a user asks what a YieldWerx term or feature means, how modules relate, what QA should verify, or needs domain context for a PRD, test case, or defect.
user-invocable: false
---

# Ask YieldWerx

## Why

Use this skill so people receive the same simple, source-based YieldWerx explanation
without loading the full handbook.

## What

This skill finds the smallest relevant chapter, explains it in plain language, and
shows where the answer came from. It does not invent missing product behavior.

## When

Use it for:

- YieldWerx terms, modules, workflows, reports, screens, calculations, and data;
- domain context for a PRD, test case, automation script, or defect;
- module relationships, ordering, boundaries, and QA risks;
- onboarding and training questions.

Do not use it as final authority when an approved PRD or durable product decision
defines the same behavior. The approved product source wins.

## Where

Start with [references/INDEX.md](references/INDEX.md). It routes each topic to one or
two chapter files. Use [references/domain-map.md](references/domain-map.md) for a
compact QA view across modules.

## How

1. Read `references/INDEX.md`.
2. Select only the files listed for the user’s topic. Usually one or two files are
   enough. Do not read every chapter.
3. If the question crosses modules, also read `references/domain-map.md`.
4. Use simple words. Explain an abbreviation the first time it appears.
5. Separate confirmed facts from your inference.
6. End important product claims with a short source note:
   `[Source: handbook-third-html, sec-ch10]`.
7. If the files do not answer the question, say `Not confirmed in the current
   knowledgebase` and state what product evidence is needed.
8. If an approved PRD conflicts with the handbook, follow the PRD and clearly report
   the conflict so the knowledgebase can be updated.

## Answer style

- Write for QAs, product owners, and new team members.
- Prefer short sentences and familiar words.
- Give the direct answer first.
- Use a small example when a formula or workflow is hard to understand.
- Never turn a handbook example into a universal rule unless the source says it is.
