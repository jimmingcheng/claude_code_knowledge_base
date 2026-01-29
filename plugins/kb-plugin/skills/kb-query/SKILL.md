---
name: kb-query
description: Query the knowledge base for stored information. Use to list topics, search facts by topic, or get KB metadata. Read-only - use kb-agent for modifications.
allowed-tools: []
argument-hint: [query-command] [args...]
---

# Knowledge Base Queries (Read-Only)

Execute read-only knowledge base queries safely. This skill provides secure access to knowledge base information without any mutation capabilities.

## Command Execution

!`
# Dynamic KB CLI resolution with fallback paths (same as main kb skill)

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
    for VERSION in "4.0.7" "4.0.6" "4.0.5" "4.0.4" "4.0.3" "4.0.2" "4.0.1" "4.0.0" "3.2.0" "3.1.0"; do
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

# Security: Only allow read-only commands
COMMAND="$1"
case "$COMMAND" in
    "info"|"list-topics"|"list-facts"|"facts-by-any-topics"|"facts-by-all-topics")
        # Safe read-only operations - allow execution
        echo "Debug: Executing read-only KB query: $COMMAND" >&2
        $KB_CLI $ARGUMENTS
        ;;
    "add-fact"|"add-topic"|"update-fact"|"remove-fact"|"remove-topic"|"set-metadata"|"set-topic-persistence"|"merge-topics"|"rename-topic")
        # Mutation operations - block with helpful message
        echo "Error: '$COMMAND' is not allowed in read-only mode." >&2
        echo "Mutation operations are restricted to kb-agent for security." >&2
        echo "Use 'claude-code task kb-agent \"<your request>\"' for content modifications." >&2
        exit 1
        ;;
    "")
        echo "Error: No command specified." >&2
        echo "Available read-only commands: info, list-topics, list-facts, facts-by-any-topics, facts-by-all-topics" >&2
        exit 1
        ;;
    *)
        echo "Error: Unknown or restricted command '$COMMAND'." >&2
        echo "Available read-only commands: info, list-topics, list-facts, facts-by-any-topics, facts-by-all-topics" >&2
        echo "For content modifications, use: claude-code task kb-agent \"<your request>\"" >&2
        exit 1
        ;;
esac
`

## Available Read-Only Commands

**Information & Statistics:**
- `info` - Show KB metadata and statistics
- `list-topics` - Show all topics
- `list-facts` - Show all facts

**Query Operations:**
- `facts-by-any-topics <topic1,topic2,...>` - Search facts matching ANY topics (OR logic)
- `facts-by-all-topics <topic1,topic2,...>` - Search facts matching ALL topics (AND logic)

## Security Features

- **Mutation Prevention**: All content modification commands are blocked
- **Clear Error Messages**: Helpful guidance when restricted operations are attempted
- **kb-agent Delegation**: Directs users to proper mutation workflow through kb-agent
- **Safe Operations Only**: Only allows commands that read existing data

## Usage Examples

```bash
# Check knowledge base status
kb-query info

# List all available topics
kb-query list-topics

# Find facts about authentication or security
kb-query facts-by-any-topics authentication,security

# Find facts that cover both React AND state management
kb-query facts-by-all-topics react,state-management
```

## For Content Modifications

This skill only provides read access. For adding, updating, or organizing knowledge:

```bash
# Use kb-agent for all content modifications
claude-code task kb-agent "remember that we use TypeScript for type safety"
claude-code task kb-agent "organize topics better"
claude-code task kb-agent "what did we decide about authentication?"
```

## Architecture Benefits

- **Fast Queries**: Direct CLI access without agent overhead for read operations
- **Secure Mutations**: All modifications go through intelligent kb-agent validation
- **Clear Boundaries**: Obvious separation between query and mutation operations
- **User Guidance**: Clear direction to proper workflow for restricted operations