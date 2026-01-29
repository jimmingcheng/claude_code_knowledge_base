#!/bin/bash
# Resolves the path to claude-kb binary
# Outputs the resolved path to stdout, exits with error if not found

KB_CLI=""
CACHE_BASE="$HOME/.claude/plugins/cache/claude-code-knowledge-base"

# Check plugin cache (user-level installations)
if [[ -d "$CACHE_BASE/kb-plugin" ]]; then
    LATEST_VERSION=$(find "$CACHE_BASE/kb-plugin" -maxdepth 1 -type d -name "[0-9]*" | sort -V | tail -1)
    if [[ -n "$LATEST_VERSION" && -x "$LATEST_VERSION/bin/claude-kb" ]]; then
        KB_CLI="$LATEST_VERSION/bin/claude-kb"
    fi
fi

# Fallback to marketplace installation
if [[ -z "$KB_CLI" && -x "$HOME/.claude/plugins/marketplaces/claude-code-knowledge-base/plugins/kb-plugin/bin/claude-kb" ]]; then
    KB_CLI="$HOME/.claude/plugins/marketplaces/claude-code-knowledge-base/plugins/kb-plugin/bin/claude-kb"
fi

# Fallback to PATH
if [[ -z "$KB_CLI" ]]; then
    KB_CLI=$(which claude-kb 2>/dev/null)
fi

# Error if not found
if [[ -z "$KB_CLI" ]]; then
    echo "Error: claude-kb not found. Checked:" >&2
    echo "  - $CACHE_BASE/kb-plugin/*/bin/claude-kb" >&2
    echo "  - ~/.claude/plugins/marketplaces/.../claude-kb" >&2
    echo "  - System PATH" >&2
    exit 1
fi

# Output the resolved path
echo "$KB_CLI"
