# Knowledge Base Directory - Secure Access Required

🔒 **IMPORTANT SECURITY NOTICE**: This directory contains a structured knowledge base that requires secure access protocols.

## ⚠️ DO NOT MODIFY FILES DIRECTLY

**Never directly edit these JSON files:**
- `kb.json` - Knowledge base metadata
- `topics.json` - Topic definitions and persistence settings
- `facts.json` - Fact content and topic associations

Direct modification bypasses critical input validation and can cause:
- Malformed topic names (entire content blocks as topic IDs)
- Data corruption and inconsistencies
- Security vulnerabilities
- Loss of semantic understanding

## ✅ Proper Access Methods

### For Knowledge Base Operations

All operations go through the intelligent `kb-agent`:

**Ask questions naturally** - Claude invokes kb-agent automatically:
- "What do we know about authentication?"
- "List all topics"
- "Show me facts about React"

**Direct invocation**:
```bash
claude-code task kb-agent "what did we decide about authentication?"
claude-code task kb-agent "remember that we use PostgreSQL"
```

### For Content Modifications
**All mutations must go through kb-agent** for intelligent validation:

```bash
# Add new knowledge with semantic topic extraction
claude-code task kb-agent "remember that we use TypeScript for type safety"

# Create organized topic structures
claude-code task kb-agent "create a topic for authentication decisions"

# Update existing information
claude-code task kb-agent "update our API authentication approach"

# Organize and clean up knowledge base
claude-code task kb-agent "organize topics better and fix any inconsistencies"
```

## 🛡️ Security Architecture

This knowledge base uses a **hybrid tool-based security model**:

1. **Input Validation**: All mutations validate and sanitize inputs to prevent malformed data
2. **Semantic Understanding**: kb-agent provides intelligent topic extraction and conflict detection
3. **Access Control**: Only authorized tools can modify content

## 🚫 Why Direct Access is Blocked

The secure architecture prevents issues like:

- **Malformed Topic Names**: Document imports creating topic IDs from entire paragraphs instead of proper topic names
- **Data Corruption**: Invalid JSON structures breaking the knowledge base
- **Security Vulnerabilities**: Injection attacks through unvalidated content
- **Semantic Confusion**: Loss of intelligent organization and conflict detection

## 📚 Background

This knowledge base was created using the claude-code-knowledge-base plugin with:
- **Metadata requirement**: kb.json must exist before content creation
- **Topic persistence**: User-created topics are protected from automatic modification
- **Conflict detection**: Intelligent identification of duplicate or contradictory information
- **Organizational intelligence**: Semantic understanding for optimal knowledge structure

## 🔧 Emergency Access

If you absolutely need to examine file contents for debugging:
- **READ ONLY**: Use the Read tool to examine file structure
- **NEVER EDIT**: Direct modification will compromise data integrity
- **Report Issues**: Contact the knowledge base maintainer for structural problems

## 📞 Getting Help

For knowledge base operations:
1. **All operations**: Use `kb-agent` (invoked automatically by Claude)
2. **Direct invocation**: Use `claude-code task kb-agent "<request>"` for explicit control
3. **Issues**: Report problems through proper channels, never edit files directly

---

**This directory is protected by intelligent agents. Respect the security model.**