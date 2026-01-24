# Knowledge Base Architecture

## Core Design

**Context Management**: Use fresh subagent context for all knowledge operations to prevent main conversation pollution.

**Division of Labor**: Clear separation between semantic analysis (LLM) and data operations (Python).

```
User → /kb Skill → kb-agent → Data Layer → Storage
```

## Component Architecture

**Main Skill** - Thin interface layer
- Parse user commands
- Orchestrate subagent operations
- Present results to user

**kb-agent Subagent** - Semantic processing
- Natural language understanding
- Tag relevance analysis
- Conflict detection and resolution
- Content merging decisions

**Data Layer** - Simple operations
- Fact retrieval and storage
- Tag management
- File I/O and validation

## Operational Flows

**Query Processing**
1. Subagent analyzes natural language query
2. Determines semantically relevant tags
3. Retrieves matching facts from data layer
4. Synthesizes response for user

**Knowledge Addition**
1. Subagent loads existing knowledge for analysis
2. Detects conflicts and merging opportunities
3. Creates consolidated content
4. Persists changes through data layer

## Key Principles

**Fresh Context** - Every operation uses clean subagent context

**Semantic Separation** - LLM handles meaning, Python handles data

**In-Memory Processing** - Load entire knowledge base for comprehensive analysis

**Single Source Truth** - One file per fact, no synchronization needed

**Git Integration** - Structure optimized for version control workflows

## Implementation Strategy

**Phase 1: Data Foundation**
- Storage layer and basic operations
- Fact loading and persistence

**Phase 2: Semantic Layer**
- Natural language processing
- Conflict detection and merging

**Phase 3: Interface Layer**
- User commands and workflows
- Auto-invocation patterns