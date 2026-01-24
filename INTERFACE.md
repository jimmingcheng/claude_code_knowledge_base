# Knowledge Base Interface

## Commands

```yaml
/kb query "How do we handle state management?"   # Natural language search
/kb add "We use React Context for shared state"  # Add new knowledge
```

## Workflows

**Query**: `/kb` → spawn `kb-agent` → analyze query → get relevant facts → return summary

**Add**: `/kb` → spawn `kb-agent` → detect conflicts → merge content → save fact

**Auto-context**: Claude → spawn `kb-agent` → get relevant facts → return curated summary

## File Structure

```
kb/
├── facts/              # Individual fact files
└── kb_engine/
    ├── kb.py           # KnowledgeBase class
    ├── fact.py         # Fact structure
    └── tag.py          # Tag structure

skills/kb/
├── skill.md            # Main /kb skill
└── kb-agent.md         # KB subagent
```
