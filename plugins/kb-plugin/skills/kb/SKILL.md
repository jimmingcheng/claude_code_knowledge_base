---
name: kb
description: Execute knowledge base operations securely. Use for all KB commands like set-metadata, add-fact, list-topics, info, etc.
allowed-tools: []
argument-hint: [command] [args...]
---

# Knowledge Base Operations

Execute knowledge base commands securely through the Claude KB CLI.

## Command Execution

!`node ../../../../dist/cli.js $ARGUMENTS`

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