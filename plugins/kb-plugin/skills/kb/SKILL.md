---
name: kb
description: Execute knowledge base operations securely. Use for all KB commands like set-metadata, add-fact, list-topics, info, etc.
allowed-tools: []
argument-hint: [command] [args...]
---

# Knowledge Base Operations

Execute knowledge base commands securely through the Claude KB CLI.

## Command Execution

!`
# Dynamic KB CLI resolution with fallback paths
if [[ -x "./dist/cli.js" ]]; then
    # Development repo structure
    KB_CLI="node ./dist/cli.js"
elif [[ -x "./plugins/kb-plugin/bin/claude-kb" ]]; then
    # Repository plugin structure
    KB_CLI="./plugins/kb-plugin/bin/claude-kb"
elif [[ -x "./bin/claude-kb" ]]; then
    # Claude Code plugin environment
    KB_CLI="./bin/claude-kb"
elif [[ -x "node_modules/@claude-code/kb-plugin/bin/claude-kb" ]]; then
    # NPM package installation
    KB_CLI="node_modules/@claude-code/kb-plugin/bin/claude-kb"
else
    # Claude Code plugin cache (user-level installations)
    # Look for latest version first, then fallback to marketplace
    if [[ -d "$HOME/.claude/plugins/cache/claude-code-knowledge-base/kb-plugin" ]]; then
        # Find the latest version by sorting version directories
        LATEST_VERSION=$(find "$HOME/.claude/plugins/cache/claude-code-knowledge-base/kb-plugin" -maxdepth 1 -type d -name "[0-9]*" | sort -V | tail -1)
        if [[ -n "$LATEST_VERSION" && -x "$LATEST_VERSION/bin/claude-kb" ]]; then
            KB_CLI="$LATEST_VERSION/bin/claude-kb"
        fi
    fi

    # Fallback to marketplace installation
    if [[ -z "$KB_CLI" && -x "$HOME/.claude/plugins/marketplaces/claude-code-knowledge-base/plugins/kb-plugin/bin/claude-kb" ]]; then
        KB_CLI="$HOME/.claude/plugins/marketplaces/claude-code-knowledge-base/plugins/kb-plugin/bin/claude-kb"
    fi

    # Dynamic search in current directory
    if [[ -z "$KB_CLI" ]]; then
        KB_CLI=$(find . -name "claude-kb" -type f -executable 2>/dev/null | head -1)
    fi

    # System PATH lookup
    if [[ -z "$KB_CLI" ]]; then
        KB_CLI=$(which claude-kb 2>/dev/null)
    fi

    # Final error if nothing found
    if [[ -z "$KB_CLI" ]]; then
        echo "Error: claude-kb CLI not found. Please ensure kb-plugin is properly installed." >&2
        exit 1
    fi
fi

$KB_CLI $ARGUMENTS
`

## Available Commands

**Setup & Info:**
- `info` - Show KB metadata and statistics
- `set-metadata <name> <description>` - Initialize KB metadata (required first)

**Content Management:**
- `add-fact <content> <topics> [sources]` - Add new fact
- `add-topic <name> <description> [persistent]` - Add new topic
- `update-fact <id> <content> <topics> [sources]` - Update existing fact
- `remove-fact <id>` - Remove fact
- `remove-topic <name>` - Remove topic

**Querying:**
- `list-topics` - Show all topics
- `list-facts` - Show all facts
- `facts-by-any-topics <topic1,topic2,...>` - Search facts (OR)
- `facts-by-all-topics <topic1,topic2,...>` - Search facts (AND)

**Organization:**
- `merge-topics <source> <target>` - Merge topics
- `rename-topic <old> <new>` - Rename topic
- `set-topic-persistence <name> <true|false>` - Change protection

All operations respect the kb.json metadata requirement and will guide you through setup if needed.