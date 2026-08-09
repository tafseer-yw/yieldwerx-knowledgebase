import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const errors = [];

function fail(message) {
  errors.push(message);
}

function requireFile(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) {
    fail(`Missing required file: ${relativePath}`);
  }
  return fullPath;
}

function parseJson(relativePath) {
  const fullPath = requireFile(relativePath);
  if (!fs.existsSync(fullPath)) return {};
  try {
    return JSON.parse(fs.readFileSync(fullPath, "utf8"));
  } catch (error) {
    fail(`Invalid JSON in ${relativePath}: ${error.message}`);
    return {};
  }
}

function sha256(file) {
  const hash = crypto.createHash("sha256");
  hash.update(fs.readFileSync(file));
  return hash.digest("hex");
}

function walk(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const requiredFiles = [
  ".claude-plugin/marketplace.json",
  ".gitattributes",
  "CODEOWNERS",
  "README.md",
  "catalog/sources.json",
  "plugins/yieldwerx-knowledgebase/.claude-plugin/plugin.json",
  "plugins/yieldwerx-knowledgebase/skills/ask-yieldwerx/SKILL.md",
  "plugins/yieldwerx-knowledgebase/skills/ask-yieldwerx/references/INDEX.md",
  "plugins/yieldwerx-knowledgebase/skills/update-yieldwerx-knowledge/SKILL.md",
];
requiredFiles.forEach(requireFile);

const marketplace = parseJson(".claude-plugin/marketplace.json");
const manifest = parseJson("plugins/yieldwerx-knowledgebase/.claude-plugin/plugin.json");
const catalog = parseJson("catalog/sources.json");

if (marketplace.name !== "yieldwerx-company") fail("Marketplace name must be yieldwerx-company.");
if (marketplace.plugins?.length !== 1) fail("Marketplace must contain exactly one plugin.");
if (marketplace.plugins?.[0]?.source !== "./plugins/yieldwerx-knowledgebase") {
  fail("Marketplace plugin source is incorrect.");
}
if (manifest.name !== "yieldwerx-knowledgebase") {
  fail("Plugin manifest name must be yieldwerx-knowledgebase.");
}
if (!/^\d+\.\d+\.\d+$/.test(manifest.version ?? "")) {
  fail("Plugin manifest version must use semantic versioning.");
}
const packageManifest = parseJson("package.json");
if (packageManifest.version !== manifest.version) {
  fail("package.json and plugin manifest versions must match.");
}

const skillsRoot = path.join(root, "plugins/yieldwerx-knowledgebase/skills");
const skillDirectories = fs
  .readdirSync(skillsRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

for (const skillName of skillDirectories) {
  const skillPath = path.join(skillsRoot, skillName, "SKILL.md");
  if (!fs.existsSync(skillPath)) {
    fail(`Skill ${skillName} does not contain SKILL.md.`);
    continue;
  }
  const content = fs.readFileSync(skillPath, "utf8");
  const frontmatter = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatter) {
    fail(`${skillName}/SKILL.md has no YAML frontmatter.`);
    continue;
  }
  if (!new RegExp(`^name:\\s*${skillName}\\s*$`, "m").test(frontmatter[1])) {
    fail(`${skillName}/SKILL.md name does not match its folder.`);
  }
  if (!/^description:\s*\S.+$/m.test(frontmatter[1])) {
    fail(`${skillName}/SKILL.md has no useful description.`);
  }
  if (!/^user-invocable:\s*false$/m.test(frontmatter[1])) {
    fail(`${skillName}/SKILL.md must stay hidden behind the public yw namespace.`);
  }
  for (const heading of ["Why", "What", "When", "Where", "How"]) {
    if (!new RegExp(`^## ${heading}$`, "m").test(content)) {
      fail(`${skillName}/SKILL.md is missing its ${heading} section.`);
    }
  }
}

const handbookRoot = path.join(
  skillsRoot,
  "ask-yieldwerx/references/handbook",
);
const chapters = fs
  .readdirSync(handbookRoot)
  .filter((file) => file.endsWith(".md"))
  .sort();
if (chapters.length !== 27) fail(`Expected 27 handbook Markdown files; found ${chapters.length}.`);

const ids = new Set();
const sections = new Set();
for (const chapter of chapters) {
  const content = fs.readFileSync(path.join(handbookRoot, chapter), "utf8");
  const id = content.match(/^id:\s*(.+)$/m)?.[1];
  const section = content.match(/^source_section:\s*(.+)$/m)?.[1];
  if (!/^---\n/.test(content) || !/^generated:\s*true$/m.test(content)) {
    fail(`${chapter} is missing generated chapter frontmatter.`);
  }
  if (!/^source_id:\s*handbook-third-html$/m.test(content)) {
    fail(`${chapter} does not cite handbook-third-html.`);
  }
  if (!id || ids.has(id)) fail(`${chapter} has a missing or duplicate ID.`);
  if (!section || sections.has(section)) fail(`${chapter} has a missing or duplicate source section.`);
  ids.add(id);
  sections.add(section);
}

const index = fs.readFileSync(
  path.join(skillsRoot, "ask-yieldwerx/references/INDEX.md"),
  "utf8",
);
for (const chapter of chapters) {
  if (!index.includes(`handbook/${chapter}`)) {
    fail(`Knowledge index does not route to ${chapter}.`);
  }
}

if (!Array.isArray(catalog.documents) || catalog.documents.length !== 13) {
  fail(`Expected 13 catalog documents; found ${catalog.documents?.length ?? 0}.`);
} else {
  const catalogIds = new Set();
  for (const document of catalog.documents) {
    if (catalogIds.has(document.id)) fail(`Duplicate catalog ID: ${document.id}`);
    catalogIds.add(document.id);
    const sourcePath = path.join(root, ...document.path.split("/"));
    if (!fs.existsSync(sourcePath)) {
      fail(`Catalog path is missing: ${document.path}`);
      continue;
    }
    if (fs.statSync(sourcePath).size !== document.bytes) {
      fail(`Catalog size differs for ${document.path}. Run npm run catalog.`);
    }
    if (sha256(sourcePath) !== document.sha256) {
      fail(`Catalog hash differs for ${document.path}. Run npm run catalog.`);
    }
  }
}

const pluginFiles = walk(path.join(root, "plugins/yieldwerx-knowledgebase"));
for (const file of pluginFiles) {
  if (!/\.(?:md|json)$/i.test(file)) continue;
  if (file.includes(`${path.sep}references${path.sep}handbook${path.sep}`)) continue;
  const content = fs.readFileSync(file, "utf8");
  if (/[A-Za-z]:\\/.test(content)) {
    fail(`Plugin file contains a machine-specific Windows path: ${path.relative(root, file)}`);
  }
}

const markdownFiles = walk(root).filter(
  (file) =>
    file.endsWith(".md") &&
    !file.includes(`${path.sep}sources${path.sep}`) &&
    !file.includes(`${path.sep}dist${path.sep}`),
);
for (const file of markdownFiles) {
  const content = fs.readFileSync(file, "utf8");
  for (const match of content.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
    const link = match[1];
    if (/^(?:https?:|mailto:|#)/.test(link)) continue;
    const clean = decodeURIComponent(link.split("#")[0]);
    const target = path.resolve(path.dirname(file), clean);
    if (!fs.existsSync(target)) {
      fail(
        `Broken local link in ${path.relative(root, file)}: ${link}`,
      );
    }
  }
}

const owners = fs.readFileSync(path.join(root, "CODEOWNERS"), "utf8");
if (!owners.includes("* tafseer.haider@yieldwerx.com")) {
  fail("CODEOWNERS does not assign all files to tafseer.haider@yieldwerx.com.");
}

if (errors.length) {
  console.error(`Knowledgebase validation failed with ${errors.length} error(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(
    `Knowledgebase validation passed: ${chapters.length} chapter files, ${catalog.documents.length} sources, ${skillDirectories.length} skills.`,
  );
}
