# Claude Code Knowledge Base

A Claude Code plugin that gives Claude persistent memory across sessions.

## Installation

See [Discover plugins](https://code.claude.com/docs/en/discover-plugins).

## Usage

All operations go through `kb-agent`. Best practice is to mention it explicitly:

```
"kb-agent: Remember that we use PostgreSQL for the database"
"kb-agent: What do we know about authentication?"
"kb-agent: Create a topic for deployment decisions"
```

Knowledge is stored in `kb/` in your project directory.

## License

MIT
