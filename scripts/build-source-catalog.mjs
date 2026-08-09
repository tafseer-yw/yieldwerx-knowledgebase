import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const sourcesRoot = path.join(root, "sources");
const output = path.join(root, "catalog/sources.json");

const metadata = {
  "sources/current/third-edition/Interactive - The yieldWerx Domain Handbook - Third Edition.html": {
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
  "sources/archive/first-edition/Interactive - The yieldWerx Domain Handbook - First Edition.html": {
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
  "sources/archive/second-edition/Interactive - The yieldWerx Domain Handbook - Second Edition.html": {
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

const files = walk(sourcesRoot).sort((a, b) => a.localeCompare(b));
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
      authority_order: [
        "approved feature specification or durable product decision",
        "current handbook",
        "secondary support material",
        "archived handbook",
      ],
      documents,
    },
    null,
    2,
  )}\n`,
  "utf8",
);
console.log(`Cataloged ${documents.length} source files.`);
