---
name: kb
description: "[DEPRECATED] Legacy KB skill. Use kb-query for read operations or kb-agent for mutations."
allowed-tools: []
argument-hint: [command] [args...]
---

# Knowledge Base Operations (DEPRECATED)

⚠️ **DEPRECATION NOTICE**: This skill has been replaced by a more secure architecture:

- **For read-only queries**: Use the `kb-query` skill instead
- **For content modifications**: Use the `kb-agent` agent instead

## Migration Guide

### For Read-Only Operations
**Old usage:**
```bash
kb info
kb list-topics
kb facts-by-any-topics authentication,security
```

**New usage:**
```bash
kb-query info
kb-query list-topics
kb-query facts-by-any-topics authentication,security
```

### For Content Modifications
**Old usage:**
```bash
kb add-fact "We use TypeScript" "typescript,tooling"
kb add-topic "authentication" "Auth decisions" true
kb update-fact 1 "Updated content" "topics"
```

**New usage:**
```bash
claude-code task kb-agent "remember that we use TypeScript for tooling"
claude-code task kb-agent "create a topic for authentication decisions"
claude-code task kb-agent "update fact 1 with new content"
```

## Why This Change?

The new architecture provides:

- **Security**: Input validation and sanitization prevents malformed data
- **Intelligence**: kb-agent provides semantic understanding and conflict detection
- **Performance**: Direct queries via kb-query without agent overhead
- **Safety**: Mutations go through intelligent validation to prevent issues like malformed topic names

## Automatic Redirection

!`
echo "⚠️  DEPRECATION WARNING: The 'kb' skill is deprecated." >&2
echo "" >&2
echo "Please use the new secure architecture:" >&2
echo "  • For queries: kb-query $ARGUMENTS" >&2
echo "  • For mutations: claude-code task kb-agent \"<your request>\"" >&2
echo "" >&2
echo "The new architecture prevents issues like malformed topic names" >&2
echo "and provides intelligent input validation." >&2
echo "" >&2

# Show which command to use
COMMAND="$1"
case "$COMMAND" in
    "info"|"list-topics"|"list-facts"|"facts-by-any-topics"|"facts-by-all-topics")
        echo "For this query operation, use: kb-query $ARGUMENTS" >&2
        ;;
    "add-fact"|"add-topic"|"update-fact"|"remove-fact"|"remove-topic"|"set-metadata"|"set-topic-persistence"|"merge-topics"|"rename-topic")
        echo "For this mutation operation, use: claude-code task kb-agent \"<describe what you want to do>\"" >&2
        ;;
    *)
        echo "Use kb-query for read operations or kb-agent for modifications" >&2
        ;;
esac

exit 1
`