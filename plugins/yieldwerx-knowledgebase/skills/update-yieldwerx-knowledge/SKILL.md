---
name: update-yieldwerx-knowledge
description: Updates the YieldWerx knowledgebase from an approved PRD, handbook edition, product decision, or corrected domain source while preserving authority, history, simple language, chapter separation, and source traceability. Use when a user asks to add, correct, review, regenerate, or publish YieldWerx domain knowledge.
user-invocable: false
---

# Update YieldWerx knowledge

## Why

Use this skill so new product knowledge is added safely, can be traced to its source,
and does not silently replace approved behavior.

## What

This skill reviews a new source, identifies affected topics, updates only the required
chapter files, and records the change. It keeps one Markdown file per chapter so
agents load less text.

## When

Use it when:

- a PRD or feature decision is approved;
- a new handbook edition is published;
- a product owner confirms a missing or corrected rule;
- a current chapter is unclear or out of date;
- the source catalog or knowledge skill must be regenerated.

Do not publish draft assumptions as confirmed facts.

## Where

In this repository:

- raw documents go under `sources/`;
- source identity and hashes go in `catalog/sources.json`;
- AI-ready chapters live under
  `plugins/yieldwerx-knowledgebase/skills/ask-yieldwerx/references/handbook/`;
- the topic router is
  `plugins/yieldwerx-knowledgebase/skills/ask-yieldwerx/references/INDEX.md`;
- change history goes in `CHANGELOG.md`.

Read [references/UPDATE-POLICY.md](references/UPDATE-POLICY.md) before changing
knowledge.

## How

1. Confirm the source owner, approval state, edition or version, and effective date.
2. Compare the new source with the current relevant chapter. Do not load unrelated
   chapters.
3. List each confirmed addition, correction, conflict, and unresolved question.
4. Put raw source material in the correct `sources/` folder.
5. Update or regenerate only the affected Markdown chapter files.
6. Update the topic index if search words or chapter routes changed.
7. Rebuild the source catalog and record the change in `CHANGELOG.md`.
8. Run `npm test`.
9. Ask the repository owner for review before merge.

## Language rules

- Use simple words and short sentences.
- Explain abbreviations at first use.
- Keep statements testable and specific.
- Separate facts, examples, and assumptions.
- Never hide a conflict between sources.
