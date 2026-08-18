/**
 * The source authority order - defined once.
 *
 * It was written out in five places with four different wordings: README.md,
 * the ask skill's SOURCES.md and INDEX.md, the update skill's UPDATE-POLICY.md,
 * and catalog/sources.json (generated from a sixth hardcoded copy inside
 * build-source-catalog.mjs). Nothing compared them, so four of the copies
 * could drift freely from the one the tooling actually reads.
 *
 * `catalog` is the machine-readable rank written into catalog/sources.json and
 * matched against each document's `authority` field. `prose` is the sentence
 * rendered into the documents. They are two views of one list, never two lists.
 */
export const AUTHORITY_ORDER = [
  {
    catalog: "approved feature specification or durable product decision",
    prose: "Approved feature specification or durable product decision.",
  },
  {
    catalog: "current handbook",
    prose: "Current YieldWerx Domain Handbook.",
  },
  {
    catalog: "secondary support material",
    prose: "Supporting product and training material.",
  },
  {
    catalog: "archived handbook",
    prose: "Archived handbook editions.",
  },
];

/** The array written into catalog/sources.json. */
export const catalogOrder = () => AUTHORITY_ORDER.map((entry) => entry.catalog);

/** The numbered markdown list rendered into the documents. */
export const proseList = () =>
  AUTHORITY_ORDER.map((entry, index) => `${index + 1}. ${entry.prose}`).join("\n");
