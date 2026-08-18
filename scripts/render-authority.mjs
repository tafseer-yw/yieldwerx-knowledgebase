#!/usr/bin/env node
/**
 * Render the source authority order into every document that states it.
 *
 * The list existed in five places with four different wordings, and nothing
 * compared them - so four copies could drift from the one the tooling reads.
 * They are now views of a single definition in scripts/lib/authority.mjs.
 *
 * Also checks the COMMITTED catalog, because catalog/sources.json is only
 * rebuilt when someone runs `npm run catalog` - which cannot happen on a clone
 * without the LFS sources hydrated. Without this check the shared definition
 * could change and the catalog everyone reads would keep the old order.
 *
 * Usage: node scripts/render-authority.mjs [--check]
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

import { AUTHORITY_ORDER, catalogOrder, proseList } from "./lib/authority.mjs";

const root = path.resolve(import.meta.dirname, "..");
const BEGIN = "<!-- BEGIN GENERATED: authority order (node scripts/render-authority.mjs) -->";
const END = "<!-- END GENERATED -->";

const TARGETS = [
  "README.md",
  "plugins/yieldwerx-knowledgebase/skills/ask-yieldwerx/references/SOURCES.md",
  "plugins/yieldwerx-knowledgebase/skills/update-yieldwerx-knowledge/references/UPDATE-POLICY.md",
];

const check = process.argv.includes("--check");
const problems = [];
let rewritten = 0;

for (const relative of TARGETS) {
  const file = path.join(root, relative);
  if (!fs.existsSync(file)) {
    problems.push(`${relative}: missing - it is supposed to state the authority order`);
    continue;
  }
  const doc = fs.readFileSync(file, "utf8");
  const start = doc.indexOf(BEGIN);
  const end = doc.indexOf(END);
  if (start === -1 || end === -1 || end < start) {
    problems.push(`${relative}: missing the generated-region markers`);
    continue;
  }
  const next = `${doc.slice(0, start + BEGIN.length)}\n\n${proseList()}\n\n${doc.slice(end)}`;
  if (doc === next) continue;
  if (check) problems.push(`${relative}: authority order is stale - run \`npm run authority:render\``);
  else {
    fs.writeFileSync(file, next);
    rewritten += 1;
  }
}

// The committed catalog must agree with the shared definition, even though it
// is only regenerated when the LFS sources are present.
const catalogPath = path.join(root, "catalog/sources.json");
if (fs.existsSync(catalogPath)) {
  const committed = JSON.parse(fs.readFileSync(catalogPath, "utf8")).authority_order ?? [];
  const expected = catalogOrder();
  if (JSON.stringify(committed) !== JSON.stringify(expected)) {
    problems.push(
      `catalog/sources.json authority_order disagrees with scripts/lib/authority.mjs\n` +
        `  committed: ${JSON.stringify(committed)}\n` +
        `  expected:  ${JSON.stringify(expected)}\n` +
        `  Run \`npm run catalog\` with the LFS sources hydrated.`,
    );
  }
}

if (problems.length) {
  console.error(`Authority order check failed with ${problems.length} problem(s):`);
  for (const p of problems) console.error(`- ${p}`);
  process.exit(1);
}
console.log(
  check
    ? `Authority order is current in ${TARGETS.length} document(s) and the catalog (${AUTHORITY_ORDER.length} tiers).`
    : `Authority order rendered into ${rewritten} document(s).`,
);
