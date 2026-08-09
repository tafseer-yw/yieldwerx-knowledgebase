# Contributing

## Before changing current knowledge

Confirm:

- the source is approved;
- the source owner or decision maker is known;
- the feature, module, edition, or effective date is clear;
- conflicts with current knowledge have been identified.

Draft meeting notes and personal understanding are not approved product sources.

## Change process

1. Create a branch from `main`.
2. Add the source under `sources/current/`, `sources/archive/`, or `sources/support/`.
3. Update only the affected chapter files.
4. Keep the wording simple, exact, and testable.
5. Run `npm run catalog` after source changes.
6. Update `CHANGELOG.md`.
7. Run `npm test`.
8. Open a pull request and request the code owner.

## Pull request evidence

State:

- source and approval state;
- affected modules and chapters;
- what changed and why;
- conflicts or open questions;
- validation result.

## Generated handbook files

Files with `generated: true` come from the current interactive handbook. Change the
source or extractor and regenerate them; do not make a manual edit that will be lost
on the next extraction.

## Writing standard

- Write for a QA who may be new to the feature.
- Use short sentences and common words.
- Explain abbreviations at first use.
- Separate facts, examples, and assumptions.
- Avoid subjective words such as `fast`, `easy`, or `user-friendly` unless the source
  defines a measurable result.
