# Claude distribution

## Claude Code

This repository is a private Claude Code marketplace. Add the Azure Repos Git URL,
then install `yieldwerx-knowledgebase@yieldwerx-company`.

Claude Code copies an installed plugin into its local plugin cache. For that reason,
all files required by the two skills are inside the plugin folder. The plugin does not
refer to the root `sources/` folder at runtime.

Official reference:
[Create and distribute a plugin marketplace](https://code.claude.com/docs/en/plugin-marketplaces).

## Claude web and desktop

Claude web and desktop accept custom skills as ZIP files. Run
`npm run package:skills`, then upload the needed ZIP from `dist/skills/`.

The `ask-yieldwerx` package contains the topic index, QA domain map, and all separate
handbook chapter files. Claude still opens only the files needed for the question.

Official references:

- [Use skills in Claude](https://support.claude.com/en/articles/12512180-use-skills-in-claude)
- [Provision and manage skills for your organization](https://support.claude.com/en/articles/13119606-provision-and-manage-skills-for-your-organization)

## Company rollout

For Claude Team or Enterprise:

1. An organization owner enables code execution and Skills.
2. Build and validate the skill ZIPs from an approved commit.
3. Provision the skills in Organization settings.
4. Test access with a normal company user.
5. Replace the provisioned ZIP after each approved knowledge release.

Organization provisioning is the simplest company-wide route for Claude web and
desktop. The marketplace is the update route for Claude Code.
