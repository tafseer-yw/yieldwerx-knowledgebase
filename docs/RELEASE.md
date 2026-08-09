# Release guide

1. Confirm `CHANGELOG.md` describes the release.
2. Run `npm run extract` if the current handbook source changed.
3. Run `npm run catalog`.
4. Bump `version` in `plugins/yieldwerx-knowledgebase/.claude-plugin/plugin.json`.
   Use semantic versioning.
5. Run `npm test`.
6. Run `claude plugin validate .` when the Claude CLI is available.
7. Run `npm run package:skills` and test both ZIP files in a non-owner Claude account.
8. Merge through the protected `main` branch.
9. Create an annotated Git tag matching the plugin version.
10. Ask Claude Code users to update the marketplace and plugin.
11. Replace the organization-provisioned skill ZIPs for Claude web/desktop.

Claude Code uses the manifest version as its update key. Every distributed change
therefore needs a version bump.
