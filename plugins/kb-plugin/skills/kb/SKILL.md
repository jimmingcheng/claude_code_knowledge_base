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

# Claude Code plugin cache (user-level installations) - CHECK FIRST
CACHE_BASE="$HOME/.claude/plugins/cache/claude-code-knowledge-base"
if [[ -d "$CACHE_BASE/kb-plugin" ]]; then
    # Find the latest version by sorting version directories
    LATEST_VERSION=$(find "$CACHE_BASE/kb-plugin" -maxdepth 1 -type d -name "[0-9]*" | sort -V | tail -1)
    if [[ -n "$LATEST_VERSION" ]]; then
        # Prefer claude-kb binary, fallback to cli.js
        if [[ -x "$LATEST_VERSION/bin/claude-kb" ]]; then
            KB_CLI="$LATEST_VERSION/bin/claude-kb"
        elif [[ -x "$LATEST_VERSION/bin/cli.js" ]]; then
            KB_CLI="node $LATEST_VERSION/bin/cli.js"
        fi
    fi
fi

# Alternative: Try specific known versions if auto-detection fails
if [[ -z "$KB_CLI" ]]; then
    for VERSION in "4.0.4" "4.0.3" "4.0.2" "4.0.1" "4.0.0" "3.2.0" "3.1.0"; do
        if [[ -x "$CACHE_BASE/kb-plugin/$VERSION/bin/claude-kb" ]]; then
            KB_CLI="$CACHE_BASE/kb-plugin/$VERSION/bin/claude-kb"
            break
        elif [[ -x "$CACHE_BASE/kb-plugin/$VERSION/bin/cli.js" ]]; then
            KB_CLI="node $CACHE_BASE/kb-plugin/$VERSION/bin/cli.js"
            break
        fi
    done
fi

# Fallback to marketplace installation
if [[ -z "$KB_CLI" && -x "$HOME/.claude/plugins/marketplaces/claude-code-knowledge-base/plugins/kb-plugin/bin/claude-kb" ]]; then
    KB_CLI="$HOME/.claude/plugins/marketplaces/claude-code-knowledge-base/plugins/kb-plugin/bin/claude-kb"
fi

# Project-level and package installations
if [[ -z "$KB_CLI" ]]; then
    if [[ -x "./bin/claude-kb" ]]; then
        # Claude Code plugin environment
        KB_CLI="./bin/claude-kb"
    elif [[ -x "node_modules/@claude-code/kb-plugin/bin/claude-kb" ]]; then
        # NPM package installation
        KB_CLI="node_modules/@claude-code/kb-plugin/bin/claude-kb"
    fi
fi

# Dynamic search fallbacks
if [[ -z "$KB_CLI" ]]; then
    # Dynamic search in current directory
    KB_CLI=$(find . -name "claude-kb" -type f -executable 2>/dev/null | head -1)

    # System PATH lookup
    if [[ -z "$KB_CLI" ]]; then
        KB_CLI=$(which claude-kb 2>/dev/null)
    fi
fi

# Final error if nothing found
if [[ -z "$KB_CLI" ]]; then
    echo "Error: claude-kb CLI not found. Please ensure kb-plugin is properly installed." >&2
    echo "Debug: Checked paths:" >&2
    echo "  - $CACHE_BASE/kb-plugin/*/bin/{claude-kb,cli.js}" >&2
    echo "  - Current directory: $PWD" >&2
    exit 1
fi

# Debug: Show which CLI we're using
echo "Debug: Using KB CLI at: $KB_CLI" >&2

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