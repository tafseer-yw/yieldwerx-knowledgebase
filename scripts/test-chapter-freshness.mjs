#!/usr/bin/env node
/**
 * Prove the freshness gate detects a hand-edited chapter.
 *
 * The real handbook is a 4.8 MB LFS object that is usually not hydrated, so a
 * test depending on it would never run and would therefore prove nothing.
 * Instead this synthesises a handbook containing the same 27 section ids the
 * extractor requires, extracts it, and then damages the output the way a human
 * would - which is exactly the case CONTRIBUTING.md forbids and nothing caught.
 *
 * Nothing here touches the committed chapters or sources.
 */

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import process from "node:process";
import { execFileSync, spawnSync } from "node:child_process";

const root = path.resolve(import.meta.dirname, "..");
let failures = 0;

const check = (label, condition, detail = "") => {
  if (condition) console.log(`ok    ${label}`);
  else {
    console.error(`FAIL  ${label}${detail ? `\n      ${detail}` : ""}`);
    failures++;
  }
};

/** The section ids the extractor requires, read from the extractor itself. */
function sectionIds() {
  const source = fs.readFileSync(path.join(root, "scripts/extract-handbook-html.mjs"), "utf8");
  const block = /const filesById = \{([\s\S]*?)\n\};/.exec(source);
  if (!block) throw new Error("could not read filesById from the extractor");
  return [...block[1].matchAll(/"([^"]+)":\s*"([^"]+)"/g)].map((m) => ({ id: m[1], file: m[2] }));
}

function syntheticHandbook(sections) {
  const body = sections
    .map(
      ({ id }) =>
        `<div class="section" id="${id}"><h1>${id}</h1><p>Synthetic content for ${id}.</p></div>`,
    )
    .join("\n");
  return `<!doctype html><html><body>\n${body}\n</body></html>\n`;
}

const sections = sectionIds();
check("the extractor declares section ids", sections.length > 0, `found ${sections.length}`);

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "yw-freshness-test-"));
try {
  const source = path.join(dir, "handbook.html");
  const chapters = path.join(dir, "chapters");
  fs.writeFileSync(source, syntheticHandbook(sections));

  execFileSync(
    process.execPath,
    [path.join(root, "scripts/extract-handbook-html.mjs"), source, chapters],
    {
      stdio: ["ignore", "ignore", "pipe"],
    },
  );
  check(
    "the extractor produced one file per declared section",
    fs.readdirSync(chapters).filter((f) => f.endsWith(".md")).length === sections.length,
  );

  // spawnSync, not execFileSync: the NOT CHECKED notice goes to stderr and
  // exits 0 deliberately, and execFileSync returns only stdout - so that case
  // was untestable and silently failed on the first run here.
  const run = () => {
    const result = spawnSync(
      process.execPath,
      [
        path.join(root, "scripts/check-chapter-freshness.mjs"),
        "--source",
        source,
        "--chapters",
        chapters,
      ],
      { encoding: "utf8", env: { ...process.env, CI: "" } },
    );
    return { code: result.status ?? 1, output: `${result.stdout ?? ""}${result.stderr ?? ""}` };
  };

  check("a freshly extracted set passes", run().code === 0);

  // The case that was silently allowed: someone edits a generated chapter.
  const victim = path.join(chapters, sections[3].file);
  fs.writeFileSync(victim, `${fs.readFileSync(victim, "utf8")}\n\nHand-written addition.\n`);
  const edited = run();
  check("a hand-edited chapter is caught", edited.code !== 0, edited.output.trim().split("\n")[0]);
  check(
    "the offending file is named",
    edited.output.includes(sections[3].file),
    `expected ${sections[3].file} in the output`,
  );

  // Restore, then delete one: the extractor produces it, the tree does not have it.
  execFileSync(
    process.execPath,
    [path.join(root, "scripts/extract-handbook-html.mjs"), source, chapters],
    {
      stdio: ["ignore", "ignore", "pipe"],
    },
  );
  fs.rmSync(path.join(chapters, sections[5].file));
  const removed = run();
  check("a deleted chapter is caught", removed.code !== 0);

  // And the honesty case: an absent source must report NOT CHECKED, not pass.
  fs.rmSync(source);
  const absent = run();
  check("an absent source reports NOT CHECKED", absent.output.includes("NOT CHECKED"));
  check("an absent source does not claim success", !absent.output.includes("freshness verified"));
} finally {
  fs.rmSync(dir, { recursive: true, force: true });
}

if (failures) {
  console.error(`\n${failures} freshness test(s) failed.`);
  process.exit(1);
}
console.log("\nChapter freshness tests passed.");
