# Claude Code Knowledge Base Interface Specification

## User-Facing Interface

These skills are directly available to users and appear in the skill catalog.

### `/kb` - Main Knowledge Base Operations
**Configuration**: Default (both user and Claude can invoke)

```yaml
---
name: kb
description: Query and manage project knowledge base
---
```

**Usage**:
- `/kb query "How does authentication work?"` - Query the knowledge base
- `/kb add <structured-knowledge>` - Add processed knowledge (typically called by Claude after analysis)
- `/kb status` - Show knowledge base statistics and health

**Auto-Invocation**: Claude can automatically query the knowledge base when needing project context during development tasks.

### `/kb-cleanup` - Knowledge Base Maintenance
**Configuration**: User-only invocation

```yaml
---
name: kb-cleanup
description: Reorganize and optimize knowledge base structure
disable-model-invocation: true
---
```

**Usage**:
- `/kb-cleanup` - Trigger comprehensive knowledge base reorganization
- Eliminates redundancies, restructures relationships, optimizes hierarchy
- User-controlled to prevent unintended destructive operations

## Internal Implementation Interface

These components are not directly user-invocable but power the knowledge base functionality.

### `knowledge-processor` - Analysis Subagent
**Configuration**: Subagent with preloaded skills

```yaml
---
name: knowledge-processor
description: Analyze sources and extract structured knowledge for knowledge base
skills:
  - kb-analysis-patterns
  - conflict-detection-rules
---
```

**Purpose**: Specialized subagent that handles knowledge extraction and conflict detection. Spawned by Claude when users provide natural language instructions like "Remember what we learned about authentication."

**Capabilities**:
- Parse different source types (conversations, documentation, code, URLs)
- Extract key insights and concepts
- Cross-reference against existing knowledge base
- Detect conflicts and overlaps
- Structure findings for knowledge base storage

### `kb-analysis-patterns` - Source Analysis Knowledge
**Configuration**: Background knowledge only

```yaml
---
name: kb-analysis-patterns
description: Patterns for extracting knowledge from different source types
user-invocable: false
---
```

**Purpose**: Provides domain expertise for analyzing different types of knowledge sources including:
- Conversation threads and debugging sessions
- Documentation and external resources
- Code commits and pull requests
- Architecture decisions and design documents

### `conflict-detection-rules` - Conflict Resolution Knowledge
**Configuration**: Background knowledge only

```yaml
---
name: conflict-detection-rules
description: Rules for identifying conflicts between new and existing knowledge
user-invocable: false
---
```

**Purpose**: Contains logic for:
- Semantic similarity detection between concepts
- Contradiction identification
- Confidence scoring for conflicting information
- Resolution strategy recommendations

## Workflow Examples

### Adding Knowledge via Natural Language
```
User: "Remember the debugging approach we just figured out"

1. Claude spawns knowledge-processor subagent (with preloaded skills)
2. Subagent analyzes recent conversation for debugging insights
3. Subagent cross-references with existing KB using conflict-detection-rules
4. Subagent returns structured analysis to Claude
5. Claude presents summary and conflicts to user
6. User approves changes
7. Claude calls /kb add with processed knowledge
```

### Querying Knowledge During Development
```
Claude working on authentication feature:

1. Claude automatically calls /kb query "authentication patterns"
2. KB returns relevant authentication knowledge
3. Claude applies this context to current development task
4. Claude provides recommendations aligned with existing patterns
```

### Maintenance Operations
```
User notices knowledge base getting unwieldy:

1. User calls /kb-cleanup
2. System analyzes entire knowledge base structure
3. Eliminates redundancies and optimizes organization
4. Reports changes made to user
5. Knowledge base is restructured for improved efficiency
```

## File Organization

```
skills/
├── kb/
│   ├── skill.md                     # Main /kb skill
│   ├── kb-cleanup.md                # Cleanup skill (user-only)
│   ├── knowledge-processor.md       # Analysis subagent
│   ├── kb-analysis-patterns.md      # Background knowledge
│   └── conflict-detection-rules.md  # Background knowledge
```