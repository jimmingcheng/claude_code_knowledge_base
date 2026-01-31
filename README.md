# Claude Code Knowledge Base

A Claude Code plugin that provides an AI agent for managing a general purpose adaptive knowledge base.

## Why

Traditional databases require you to define structure upfront. But human memory doesn't work that way—it organically reorganizes around what matters most.

This plugin creates a knowledge store that behaves similarly: as you add information, it reconfigures and absorbs it into an organizational structure that evolves over time. Just as each person's mind is shaped by their unique concerns, each knowledge base adapts to its own shape—a memory system that emerges naturally around your specific use case.

LLMs make this possible. Their ability to understand context and meaning—rather than just matching keywords—allows them to categorize, reorganize, and retrieve information the way a human assistant would, without requiring rigid schemas or predefined queries.

This implementation is shaped for Claude Code, where knowledge naturally centers around projects. The knowledge base lives as JSON files inside your git repo—no vector databases, external services, or additional dependencies. Conventional logic runs on Node.js (already part of Claude Code), and all LLM intelligence flows through Claude Code's own agent infrastructure. Everything stays portable, versioned, and self-contained.

## How It Works

The knowledge base consists of **facts** and **topics**. Each fact is tagged with one or more topics. Topics help agents find facts that are relevant to user queries. Topics also give agents a mechanism to evolve the shape of the knowledge base—emphasizing important topics and facts, pruning irrelevant ones, and consolidating as needed.

Important topics may be marked **persistent** by the user. These topics will never be modified without user approval. Non-persistent topics may be freely created or destroyed by the agent.

### Key Concepts

| Term | Description |
|------|-------------|
| **kb** | The knowledge base |
| **kb-agent** | The AI agent that gatekeeps and maintains the knowledge base |
| **fact** | A discrete piece of knowledge stored in the KB |
| **topic** | A category to aggregate facts around |
| **persistent topic** | A topic marked as immutable by the user |

## Installation

See [Anthropic's instructions for installing Claude Code plugins](https://code.claude.com/docs/en/discover-plugins).

## Usage

All operations should go through `kb-agent`. The knowledge base is stored in `kb/` in your project directory. While this is directly accessible to Claude Code, best practice is to explicitly mention `kb-agent` to make certain the knowledge base is managed properly:

```
"kb-agent: Remember that we use PostgreSQL for the database"
"kb-agent: What do we know about authentication?"
"kb-agent: Create a topic for deployment decisions"
```

## License

MIT
