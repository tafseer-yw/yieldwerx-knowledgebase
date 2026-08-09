# Architecture

## Four layers

| Layer | Purpose | Location |
| --- | --- | --- |
| Source | Original internal documents | `sources/` |
| Catalog | Identity, authority, and content hashes | `catalog/sources.json` |
| Knowledge | Small AI-ready Markdown chapters and routing | `plugins/yieldwerx-knowledgebase/skills/ask-yieldwerx/references/` |
| Distribution | Claude plugin and standalone skill ZIPs | `.claude-plugin/`, `plugins/`, and generated `dist/` |

## Why chapter files are separate

Claude first sees the short skill description, then the skill instructions, then the
topic index. It reads a chapter only when the question needs that topic. A PAT question
does not load reports, SPC, cluster detection, or the complete glossary.

This progressive loading reduces token use and makes the source of each answer clear.

## Why raw files are outside the plugin

Raw PDFs, DOCX files, and interactive HTML files are important for audit and visual
comparison, but normal questions do not need them. Claude Code copies only the plugin
folder into its plugin cache. The portable `ask-yieldwerx` ZIP includes the compact
Markdown knowledge but not the large binaries.

## Update flow

```text
Approved source
    -> sources/
    -> catalog hash
    -> affected Markdown chapters
    -> routing index
    -> validation
    -> code-owner review
    -> company distribution
```

## Repository independence

No chapter contains an absolute local path or a dependency on a test framework.
PROBE and automation frameworks consume the skill or a versioned artifact. They do not
own this knowledge, so a domain update does not require a framework release.
