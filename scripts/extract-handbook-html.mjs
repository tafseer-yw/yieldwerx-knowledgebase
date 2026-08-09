import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = path.resolve(import.meta.dirname, "..");
const defaultInput = path.join(
  root,
  "sources/current/third-edition/Interactive - The yieldWerx Domain Handbook - Third Edition.html",
);
const defaultOutput = path.join(
  root,
  "plugins/yieldwerx-knowledgebase/skills/ask-yieldwerx/references/handbook",
);

const input = path.resolve(process.argv[2] || defaultInput);
const output = path.resolve(process.argv[3] || defaultOutput);

const filesById = {
  "sec-welcome": "00-how-to-use-this-handbook.md",
  "sec-learn": "01-learning-path.md",
  "sec-ch0": "chapter-00-silicon-101.md",
  "sec-ch1": "chapter-01-chips-yield-and-money.md",
  "sec-ch2": "chapter-02-players-and-product.md",
  "sec-ch3": "chapter-03-life-of-a-chip.md",
  "sec-ch4": "chapter-04-binning.md",
  "sec-ch5": "chapter-05-statistics-survival-kit.md",
  "sec-ch6": "chapter-06-stdf-and-atdf.md",
  "sec-ch7": "chapter-07-architecture.md",
  "sec-ch8": "chapter-08-reports-and-desktop-application.md",
  "sec-ch9": "chapter-09-clm.md",
  "sec-ch10": "chapter-10-pat-and-mvpat.md",
  "sec-ch11": "chapter-11-swm-gdbn-and-sbyl.md",
  "sec-ch12": "chapter-12-spc.md",
  "sec-ch13": "chapter-13-amg-lg-and-dashboards.md",
  "sec-ch14": "chapter-14-wearing-all-the-hats.md",
  "sec-ch15": "chapter-15-rule-engine.md",
  "sec-ch16": "chapter-16-application-terms-screens-and-ui.md",
  "sec-ch17": "chapter-17-cluster-detection.md",
  "sec-appA": "appendix-a-quiz-answer-key.md",
  "sec-appB": "appendix-b-master-glossary.md",
  "sec-appC": "appendix-c-known-gaps.md",
  "sec-appD": "appendix-d-naming-caution.md",
  "sec-appE": "appendix-e-reading-paths-by-role.md",
  "sec-appF": "appendix-f-mental-map.md",
  "sec-closing": "closing-note.md",
};

const entityMap = {
  amp: "&",
  apos: "'",
  bull: "•",
  copy: "©",
  deg: "°",
  emsp: " ",
  ensp: " ",
  gt: ">",
  hellip: "…",
  laquo: "«",
  ldquo: "“",
  lsquo: "‘",
  lt: "<",
  mdash: "—",
  micro: "µ",
  middot: "·",
  nbsp: " ",
  ndash: "–",
  plusmn: "±",
  quot: '"',
  raquo: "»",
  rdquo: "”",
  reg: "®",
  rsquo: "’",
  sect: "§",
  sigma: "σ",
  thinsp: " ",
  times: "×",
  trade: "™",
};

function decodeEntities(value) {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, decimal) => String.fromCodePoint(Number.parseInt(decimal, 10)))
    .replace(/&([a-z]+);/gi, (whole, name) => entityMap[name] ?? whole);
}

function plainText(value) {
  return decodeEntities(
    value
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " "),
  ).trim();
}

function inline(value) {
  return decodeEntities(
    value
      .replace(/<br\s*\/?>/gi, "  \n")
      .replace(/<(strong|b)\b[^>]*>([\s\S]*?)<\/\1>/gi, "**$2**")
      .replace(/<(em|i)\b[^>]*>([\s\S]*?)<\/\1>/gi, "*$2*")
      .replace(/<code\b[^>]*>([\s\S]*?)<\/code>/gi, "`$1`")
      .replace(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)")
      .replace(/<span\b[^>]*>([\s\S]*?)<\/span>/gi, "$1")
      .replace(/<sup\b[^>]*>([\s\S]*?)<\/sup>/gi, "^$1")
      .replace(/<sub\b[^>]*>([\s\S]*?)<\/sub>/gi, "_$1")
      .replace(/<[^>]+>/g, "")
      .replace(/[ \t]+/g, " ")
      .replace(/ *\n */g, "\n"),
  ).trim();
}

function escapeCell(value) {
  return inline(value).replace(/\|/g, "\\|").replace(/\n/g, "<br>");
}

function convertTable(table) {
  const rows = [...table.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].map((match) =>
    [...match[1].matchAll(/<(th|td)\b[^>]*>([\s\S]*?)<\/\1>/gi)].map((cell) =>
      escapeCell(cell[2]),
    ),
  );
  if (!rows.length) return "";
  const width = Math.max(...rows.map((row) => row.length));
  const normalized = rows.map((row) => [
    ...row,
    ...Array.from({ length: width - row.length }, () => ""),
  ]);
  const header = normalized[0];
  return [
    `| ${header.join(" | ")} |`,
    `| ${header.map(() => "---").join(" | ")} |`,
    ...normalized.slice(1).map((row) => `| ${row.join(" | ")} |`),
  ].join("\n");
}

function convertList(list, ordered) {
  const items = [...list.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)];
  return items
    .map((item, index) => `${ordered ? `${index + 1}.` : "-"} ${inline(item[1])}`)
    .join("\n");
}

function htmlToMarkdown(source) {
  let value = source
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style|svg|button|nav)\b[\s\S]*?<\/\1>/gi, "")
    .replace(/<img\b[^>]*>/gi, "")
    .replace(/<div\b[^>]*class=["'][^"']*(?:toolbar|chips|meta|breadcrumb|progress|quiz-controls|chapter-nav)[^"']*["'][^>]*>[\s\S]*?<\/div>/gi, "");

  const blocks = [];
  const hold = (markdown) => {
    const token = `\n\n@@BLOCK_${blocks.length}@@\n\n`;
    blocks.push(markdown);
    return token;
  };

  value = value.replace(/<table\b[^>]*>[\s\S]*?<\/table>/gi, (table) => hold(convertTable(table)));
  value = value.replace(/<pre\b[^>]*>([\s\S]*?)<\/pre>/gi, (_, body) =>
    hold(`\`\`\`\n${plainText(body)}\n\`\`\``),
  );
  value = value.replace(/<(ol|ul)\b[^>]*>([\s\S]*?)<\/\1>/gi, (_, tag, body) =>
    hold(convertList(`<${tag}>${body}</${tag}>`, tag.toLowerCase() === "ol")),
  );
  value = value.replace(/<blockquote\b[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, body) =>
    hold(
      inline(body)
        .split("\n")
        .map((line) => `> ${line}`)
        .join("\n"),
    ),
  );
  value = value.replace(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi, (_, level, body) =>
    hold(`${"#".repeat(Number(level))} ${inline(body)}`),
  );
  value = value.replace(/<p\b[^>]*>([\s\S]*?)<\/p>/gi, (_, body) => hold(inline(body)));
  value = value.replace(/<(?:div|section|article|header|footer|aside)\b[^>]*>/gi, "\n\n");
  value = value.replace(/<\/(?:div|section|article|header|footer|aside)>/gi, "\n\n");
  value = value.replace(/<hr\b[^>]*>/gi, "\n\n---\n\n");
  value = inline(value);
  value = value.replace(/@@BLOCK_(\d+)@@/g, (_, index) => blocks[Number(index)]);
  return value
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function yamlString(value) {
  return JSON.stringify(value.replace(/\s+/g, " ").trim());
}

if (!fs.existsSync(input)) {
  throw new Error(`Handbook HTML was not found: ${input}`);
}

const html = fs.readFileSync(input, "utf8");
const starts = [...html.matchAll(/<div\s+class=["']section["']\s+id=["']([^"']+)["'][^>]*>/gi)];
const selected = starts.filter((match) => filesById[match[1]]);

if (selected.length !== Object.keys(filesById).length) {
  const found = new Set(selected.map((match) => match[1]));
  const missing = Object.keys(filesById).filter((id) => !found.has(id));
  throw new Error(`Expected 27 handbook sections. Missing: ${missing.join(", ")}`);
}

fs.mkdirSync(output, { recursive: true });
for (const existing of fs.readdirSync(output)) {
  if (existing.endsWith(".md")) fs.rmSync(path.join(output, existing));
}

for (let index = 0; index < selected.length; index += 1) {
  const match = selected[index];
  const id = match[1];
  const start = match.index;
  const end = selected[index + 1]?.index ?? html.length;
  const section = html.slice(start, end);
  const heading = section.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  const fallbackHeading = section.match(/<h[2-6]\b[^>]*>([\s\S]*?)<\/h[2-6]>/i);
  const title = plainText((heading ?? fallbackHeading)?.[1] ?? id);
  const markdown = htmlToMarkdown(section);
  const frontmatter = [
    "---",
    `id: handbook-third-${id}`,
    `title: ${yamlString(title)}`,
    "source_id: handbook-third-html",
    `source_section: ${id}`,
    "edition: 3",
    "status: current",
    "confidentiality: internal",
    "generated: true",
    "---",
    "",
  ].join("\n");
  fs.writeFileSync(path.join(output, filesById[id]), `${frontmatter}${markdown}\n`, "utf8");
}

console.log(`Generated ${selected.length} chapter files in ${path.relative(root, output)}.`);
