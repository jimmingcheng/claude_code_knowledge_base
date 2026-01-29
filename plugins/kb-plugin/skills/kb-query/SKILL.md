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
# Use CLAUDE_PLUGIN_ROOT for simple, reliable path resolution
KB_CLI="${CLAUDE_PLUGIN_ROOT}/bin/claude-kb"

if [[ ! -x "$KB_CLI" ]]; then
    echo "Error: claude-kb not found at $KB_CLI" >&2
    echo "Please ensure kb-plugin is properly installed." >&2
    exit 1
fi

# Security: Only allow read-only commands
# Extract first argument from $ARGUMENTS (skills use $ARGUMENTS, not $1)
COMMAND=$(echo $ARGUMENTS | awk '{print $1}')
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