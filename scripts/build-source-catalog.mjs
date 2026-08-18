import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { catalogOrder } from "./lib/authority.mjs";

const root = path.resolve(import.meta.dirname, "..");
const sourcesRoot = path.join(root, "sources");
const output = path.join(root, "catalog/sources.json");

const metadata = {
  "sources/current/third-edition/Interactive - The yieldWerx Domain Handbook - Third Edition.html":
    {
      id: "handbook-third-html",
      title: "The yieldWerx Domain Handbook - Third Edition (Interactive)",
      type: "handbook",
      edition: 3,
      status: "current",
      authority: "primary",
    },
  "sources/current/third-edition/The yieldWerx Domain Handbook - Third Edition.pdf": {
    id: "handbook-third-pdf",
    title: "The yieldWerx Domain Handbook - Third Edition",
    type: "handbook",
    edition: 3,
    status: "current",
    authority: "primary",
  },
  "sources/archive/first-edition/Interactive - The yieldWerx Domain Handbook - First Edition.html":
    {
      id: "handbook-first-html",
      title: "The yieldWerx Domain Handbook - First Edition (Interactive)",
      type: "handbook",
      edition: 1,
      status: "archived",
      authority: "historical",
    },
  "sources/archive/first-edition/The yieldWerx Domain Handbook - First Edition.docx": {
    id: "handbook-first-docx",
    title: "The yieldWerx Domain Handbook - First Edition",
    type: "handbook",
    edition: 1,
    status: "archived",
    authority: "historical",
  },
  "sources/archive/first-edition/The yieldWerx Domain Handbook - First Edition.pdf": {
    id: "handbook-first-pdf",
    title: "The yieldWerx Domain Handbook - First Edition",
    type: "handbook",
    edition: 1,
    status: "archived",
    authority: "historical",
  },
  "sources/archive/second-edition/Interactive - The yieldWerx Domain Handbook - Second Edition.html":
    {
      id: "handbook-second-html",
      title: "The yieldWerx Domain Handbook - Second Edition (Interactive)",
      type: "handbook",
      edition: 2,
      status: "archived",
      authority: "historical",
    },
  "sources/archive/second-edition/The yieldWerx Domain Handbook - Second Edition.docx": {
    id: "handbook-second-docx",
    title: "The yieldWerx Domain Handbook - Second Edition",
    type: "handbook",
    edition: 2,
    status: "archived",
    authority: "historical",
  },
  "sources/archive/second-edition/The yieldWerx Domain Handbook - Second Edition.pdf": {
    id: "handbook-second-pdf",
    title: "The yieldWerx Domain Handbook - Second Edition",
    type: "handbook",
    edition: 2,
    status: "archived",
    authority: "historical",
  },
  "sources/support/NotebookLM_Video_Prompts.md": {
    id: "support-notebooklm-video-prompts",
    title: "NotebookLM Video Prompts",
    type: "support",
    status: "supporting",
    authority: "non-authoritative",
  },
  "sources/support/yieldWerx Application - Complete User Guide (Internal).pdf": {
    id: "support-application-user-guide",
    title: "yieldWerx Application - Complete User Guide (Internal)",
    type: "user-guide",
    status: "supporting",
    authority: "secondary",
  },
  "sources/support/yieldWerx Fundamentals - Key Terminologies.pdf": {
    id: "support-key-terminologies",
    title: "yieldWerx Fundamentals - Key Terminologies",
    type: "training",
    status: "supporting",
    authority: "secondary",
  },
  "sources/support/yieldWerx.pdf": {
    id: "support-yieldwerx-overview",
    title: "yieldWerx Overview",
    type: "support",
    status: "supporting",
    authority: "secondary",
  },
  "sources/support/yieldWerx_SQA_Domain_Training_Plan v3.1.pdf": {
    id: "support-sqa-domain-training-plan-v3-1",
    title: "yieldWerx SQA Domain Training Plan v3.1",
    type: "training",
    status: "supporting",
    authority: "secondary",
  },
};

function walk(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  });
}

function sha256(file) {
  const hash = crypto.createHash("sha256");
  hash.update(fs.readFileSync(file));
  return hash.digest("hex");
}

/**
 * A Git LFS pointer is a ~130-byte text stub standing in for the real file.
 *
 * This guard exists because the missing-file check below cannot see one. With
 * git-lfs absent, or objects unfetched (the common GIT_LFS_SKIP_SMUDGE=1
 * state), every source is PRESENT on disk and 130 bytes long. Without this
 * check the catalog would be rebuilt from pointer text: every real content
 * hash silently replaced by the hash of a stub, `npm test` passing against
 * the corrupted result, and CI passing too - the integrity control this
 * repository is built around, inverted by its own build script.
 *
 * Fail loudly instead. A hash that was not computed over real content must
 * never be written as though it were.
 */
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

const files = walk(sourcesRoot).sort((a, b) => a.localeCompare(b));

const pointers = files
  .filter(isLfsPointer)
  .map((file) => path.relative(root, file).replaceAll("\\", "/"));
if (pointers.length) {
  throw new Error(
    `Refusing to build the catalog from Git LFS pointer stubs - the real file content is not present.\n` +
      `Hashing these would overwrite every real sha256 with the hash of a stub, and both npm test and CI\n` +
      `would then pass against a corrupted catalog.\n\n` +
      `${pointers.map((p) => `  ${p}`).join("\n")}\n\n` +
      `Fix: install git-lfs and run \`git lfs pull\` (or re-clone without GIT_LFS_SKIP_SMUDGE=1).`,
  );
}

const documents = files.map((file) => {
  const relativePath = path.relative(root, file).replaceAll("\\", "/");
  const details = metadata[relativePath];
  if (!details) throw new Error(`No catalog metadata is defined for ${relativePath}`);
  const stat = fs.statSync(file);
  return {
    ...details,
    confidentiality: "internal",
    path: relativePath,
    sha256: sha256(file),
    bytes: stat.size,
  };
});

const missing = Object.keys(metadata).filter(
  (expected) => !documents.some((document) => document.path === expected),
);
if (missing.length) throw new Error(`Catalog source files are missing:\n${missing.join("\n")}`);

fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(
  output,
  `${JSON.stringify(
    {
      schema_version: 1,
      authority_order: catalogOrder(),
      documents,
    },
    null,
    2,
  )}\n`,
  "utf8",
);
console.log(`Cataloged ${documents.length} source files.`);
