# Claude Code Instructions for Knowledge Base Plugin

## Development Guidelines

### Version Management

**Before ANY commit:**
1. Check if `plugins/kb-plugin/.claude-plugin/plugin.json` needs a version bump
2. Version should be bumped when:
   - Agent instructions are modified (`plugins/kb-plugin/agents/kb-agent.md`)
   - Plugin functionality changes
   - CLI tool features are added/modified
   - Any user-facing behavior changes
3. Use semantic versioning (MAJOR.MINOR.PATCH):
   - MAJOR: Breaking changes to agent behavior or CLI interface
   - MINOR: New features, significant improvements, or non-breaking behavior changes
   - PATCH: Bug fixes, documentation updates, minor tweaks

### Commit Process

1. Review changes: `git status` and `git diff`
2. Check if version bump needed in `plugins/kb-plugin/.claude-plugin/plugin.json`
3. If version bumped, mention it in commit message
4. Follow project's commit message conventions

### Deploy

When the user says "deploy", this means:
1. Bump the version in `plugins/kb-plugin/.claude-plugin/plugin.json`
2. Commit all changes
3. Push to `origin main`

This publishes the latest version so users who have installed this plugin from the Claude Code plugin marketplace can pull the update.

### Project Structure

- `plugins/kb-plugin/` - Main plugin code
  - `agents/kb-agent.md` - Agent instructions (version bump on changes)
  - `.claude-plugin/plugin.json` - Plugin metadata and version
  - `bin/` - CLI binaries
- `src/` - Source code for CLI tool
- `kb/` - Example knowledge base data
