# PROBE integration

## Recommended setup

Install two independent plugins in the same Claude environment:

- `yieldwerx-probe` for the QA process;
- `yieldwerx-knowledgebase` for YieldWerx domain facts.

PROBE remains usable for any product. When a YieldWerx PRD is analyzed, Claude can
load `ask-yieldwerx`, read the relevant domain chapter, and then continue the PROBE
stage.

## Test framework setup

The test framework should not contain a copied handbook. Use one of these methods:

1. Install both Claude plugins for interactive work.
2. Clone both repositories as siblings in a development workspace.
3. Download a versioned knowledge artifact in CI when a non-Claude tool needs the
   Markdown.

Pin a release tag or commit in controlled CI. Update the pin after reviewing a new
knowledgebase release.

## Failure behavior

If the knowledgebase is not available:

- PROBE can still run as a generic QA process;
- YieldWerx-specific facts must be marked unconfirmed;
- the process must not guess module rules from old framework examples.

## No cross-repository write

PROBE reads knowledge. It does not change this repository. Use
`update-yieldwerx-knowledge` and a separate pull request for knowledge changes.
