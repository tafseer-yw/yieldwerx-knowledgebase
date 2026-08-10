# Changelog

All important knowledge and distribution changes are recorded here.

## 1.1.1 - 2026-08-10

### Changed

- Added the human-readable plugin name **yieldWerx Knowledgebase** for Claude
  Desktop while retaining `yieldwerx-knowledgebase` as the stable plugin
  identifier.

## 1.1.0 - 2026-07-29

### Changed

- Kept the knowledge skills available to Claude and the `yw` adapter plugin.
- Hid the internal `yieldwerx-knowledgebase:*` commands from the user-facing
  slash-command menu; users now invoke `yw:ask-yieldwerx` and
  `yw:update-yieldwerx-knowledge`.

## 1.0.0 - 2026-07-29

### Added

- Standalone YieldWerx knowledge repository structure.
- Current Third Edition handbook and archived First and Second Editions.
- Supporting internal product and training material.
- One AI-ready Markdown file per handbook chapter and appendix.
- `ask-yieldwerx` and `update-yieldwerx-knowledge` portable skills.
- Claude Code marketplace metadata and Claude web/desktop skill packaging.
- Source catalog with SHA-256 hashes.
- Validation, Git LFS configuration, governance, and Azure pipeline.
