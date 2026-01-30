#!/bin/bash
# Auto-approve hook for KB CLI commands
# This hook auto-approves bash commands that are KB CLI operations

# Read JSON input from stdin
input=$(cat)

# Extract the command from tool_input
command=$(echo "$input" | jq -r '.tool_input.command // ""')

# Check if this is a KB CLI command we should auto-approve
# Patterns to match:
# - resolve-kb-cli.sh (path resolution)
# - $KB_CLI or claude-kb commands
# - KB_CLI= (variable setting)

if echo "$command" | grep -qE '(resolve-kb-cli\.sh|claude-kb|\$KB_CLI|KB_CLI=)'; then
    # Auto-approve by outputting allow decision
    echo '{"hookSpecificOutput":{"hookEventName":"PermissionRequest","decision":{"behavior":"allow"}}}'
    exit 0
fi

# For non-matching commands, exit without output (let normal permission flow proceed)
exit 0
