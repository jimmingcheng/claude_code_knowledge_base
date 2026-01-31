#!/bin/bash
# Sets up KB_CLI environment variable for kb-agent
# Run with: source <path>/setup-kb-env.sh
# Outputs: exports KB_CLI to the resolved claude-kb path

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Try resolve-kb-cli.sh in same directory first
if [[ -x "$SCRIPT_DIR/resolve-kb-cli.sh" ]]; then
    KB_CLI=$("$SCRIPT_DIR/resolve-kb-cli.sh" 2>/dev/null)
fi

# Fallback: check plugin cache
if [[ -z "$KB_CLI" ]]; then
    CACHE_BASE="$HOME/.claude/plugins/cache/claude-code-knowledge-base"
    if [[ -d "$CACHE_BASE/kb-plugin" ]]; then
        LATEST_VERSION=$(find "$CACHE_BASE/kb-plugin" -maxdepth 1 -type d -name "[0-9]*" | sort -V | tail -1)
        if [[ -n "$LATEST_VERSION" && -x "$LATEST_VERSION/bin/claude-kb" ]]; then
            KB_CLI="$LATEST_VERSION/bin/claude-kb"
        fi
    fi
fi

# Fallback: marketplace installation
if [[ -z "$KB_CLI" && -x "$HOME/.claude/plugins/marketplaces/claude-code-knowledge-base/plugins/kb-plugin/bin/claude-kb" ]]; then
    KB_CLI="$HOME/.claude/plugins/marketplaces/claude-code-knowledge-base/plugins/kb-plugin/bin/claude-kb"
fi

# Fallback: PATH
if [[ -z "$KB_CLI" ]]; then
    KB_CLI=$(which claude-kb 2>/dev/null)
fi

# Error if not found
if [[ -z "$KB_CLI" ]]; then
    echo "Error: claude-kb not found" >&2
    exit 1
fi

export KB_CLI
echo "KB_CLI=$KB_CLI"
