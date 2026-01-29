---
name: kb-query
description: Search the knowledge base for facts by topic. Pass topic names to search (e.g., "authentication security" searches for facts about authentication OR security). Also supports commands like "info", "list-topics", "list-facts". Read-only - use kb-agent for modifications.
allowed-tools: []
argument-hint: [topics...] or [command]
---

# Knowledge Base Queries (Read-Only)

Execute read-only knowledge base queries safely. This skill provides secure access to knowledge base information without any mutation capabilities.

## Command Execution

!`
# Use CLAUDE_PLUGIN_ROOT for simple, reliable path resolution
KB_CLI="${CLAUDE_PLUGIN_ROOT}/bin/claude-kb"

# Parse arguments: first word determines behavior
FIRST_ARG=$(echo "$ARGUMENTS" | awk '{print $1}')

# Check if first argument is a known command
case "$FIRST_ARG" in
    "info"|"list-topics"|"list-facts"|"facts-by-any-topics"|"facts-by-all-topics")
        # Direct command invocation - pass through as-is
        $KB_CLI $ARGUMENTS
        ;;
    "add-fact"|"add-topic"|"update-fact"|"remove-fact"|"remove-topic"|"set-metadata"|"set-topic-persistence"|"merge-topics"|"rename-topic")
        # Mutation operations - block with helpful message
        echo "Error: '$FIRST_ARG' is not allowed in read-only mode." >&2
        echo "Mutation operations are restricted to kb-agent for security." >&2
        echo "Use kb-agent for content modifications." >&2
        exit 1
        ;;
    "")
        # No arguments - show info
        $KB_CLI info
        ;;
    *)
        # Treat arguments as topic search (default behavior)
        # Convert space-separated topics to comma-separated for facts-by-any-topics
        TOPICS=$(echo "$ARGUMENTS" | tr ' ' ',')
        $KB_CLI facts-by-any-topics "$TOPICS"
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