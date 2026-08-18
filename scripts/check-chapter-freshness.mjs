#!/usr/bin/env node
/**
 * Prove the generated chapters still match the source they claim to come from.
 *
 * CONTRIBUTING.md says: "Files with `generated: true` come from the current
 * interactive handbook. Change the source or extractor and regenerate them; do
 * not make a manual edit that will be lost on the next extraction."
 *
 * Nothing enforced that. validate.mjs confirms the chapters LOOK generated -
 * it checks for `generated: true` and the right `source_id` - but never that
 * they ARE current. So a hand-edited chapter passed `npm test` silently, and
 * because sources/ is LFS-only and rarely hydrated, hand-editing was the path
 * of least resistance. Note the asymmetry that made this the weak link:
 * source-to-catalog freshness is cryptographically gated by SHA-256, while
 * source-to-chapter freshness was not gated at all - and the chapters are what
 * carry the actual knowledge.
 *
 * This re-runs the extractor into a scratch directory and diffs. It never
 * writes to the committed chapters.
 *
 * Usage: node scripts/check-chapter-freshness.mjs [--source <html>] [--chapters <dir>]
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import os from "node:os";
import { execFileSync } from "node:child_process";

const root = path.resolve(import.meta.dirname, "..");
const arg = (name, fallback) => {
  const index = process.argv.indexOf(`--${name}`);
  return index !== -1 && process.argv[index + 1] ? path.resolve(process.argv[index + 1]) : fallback;
};

const source = arg(
  "source",
  path.join(root, "sources/current/third-edition/Interactive - The yieldWerx Domain Handbook - Third Edition.html"),
);
const chapters = arg(
  "chapters",
  path.join(root, "plugins/yieldwerx-knowledgebase/skills/ask-yieldwerx/references/handbook"),
);

const LFS_POINTER_PREFIX = "version https://git-lfs.github.com/spec/v1";

function isLfsPointer(file) {
  const handle = fs.openSync(file, "r");
  try {
    const buffer = Buffer.alloc(LFS_POINTER_PREFIX.length);
    const read = fs.readSync(handle, buffer, 0, buffer.length, 0);
    return read === buffer.length && buffer.toString("utf8") === LFS_POINTER_PREFIX;
  } finally {
    fs.closeSync(handle);
  }
}

/**
 * A check that could not run is reported as not-run, never as passed.
 *
 * Locally that is a loud skip and exit 0, because a developer without git-lfs
 * hydrated should not be blocked by an environment fact. In CI it is a hard
 * failure: the pipeline checks out with `lfs: true`, so an absent or
 * unhydrated source there means hydration broke, and silently skipping would
 * turn this gate off for everyone while the build stayed green.
 */
function notChecked(reason) {
  const inCi = Boolean(process.env.CI);
  console.error(`NOT CHECKED: chapter freshness was not verified - ${reason}`);
  if (inCi) {
    console.error("This is CI, where the source is checked out with lfs: true. Treating it as a failure.");
    process.exit(1);
  }
  console.error("Install git-lfs and run `git lfs pull` to run this check locally.");
  process.exit(0);
}

if (!fs.existsSync(source)) notChecked(`the handbook source is absent at ${path.relative(root, source)}`);
if (isLfsPointer(source)) notChecked("the handbook source on disk is a Git LFS pointer stub, not the real file");
if (!fs.existsSync(chapters)) notChecked(`the chapters directory is absent at ${path.relative(root, chapters)}`);

const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "yw-freshness-"));
try {
  execFileSync(
    process.execPath,
    [path.join(root, "scripts/extract-handbook-html.mjs"), source, scratch],
    { stdio: ["ignore", "ignore", "pipe"] },
  );

  const committed = fs.readdirSync(chapters).filter((f) => f.endsWith(".md")).sort();
  const fresh = fs.readdirSync(scratch).filter((f) => f.endsWith(".md")).sort();

  const drifted = [];
  const missing = fresh.filter((f) => !committed.includes(f));
  const extra = committed.filter((f) => !fresh.includes(f));

  for (const file of fresh.filter((f) => committed.includes(f))) {
    const a = fs.readFileSync(path.join(chapters, file), "utf8");
    const b = fs.readFileSync(path.join(scratch, file), "utf8");
    if (a !== b) drifted.push(file);
  }

  if (drifted.length || missing.length || extra.length) {
    console.error("Chapter freshness check failed - the committed chapters do not match a fresh extraction.\n");
    for (const f of drifted) console.error(`- edited by hand or stale: ${f}`);
    for (const f of missing) console.error(`- missing (the extractor produces it): ${f}`);
    for (const f of extra) console.error(`- present but no longer produced by the extractor: ${f}`);
    console.error(
      "\nGenerated chapters are derived, never authored. Change the source or the extractor and run\n" +
        "`npm run extract`; a manual edit here is lost on the next extraction.",
    );
    process.exit(1);
  }

  console.log(`Chapter freshness verified: ${fresh.length} chapters match a fresh extraction of the current handbook.`);
} finally {
  fs.rmSync(scratch, { recursive: true, force: true });
}
