#!/usr/bin/env bash
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/../.env"
if [ -f "$ENV_FILE" ]; then
  set -a
  source "$ENV_FILE"
  set +a
fi
# --env loads FIGMA_API_KEY from repo .env (same as .mcp.json args for Claude Code)
exec npx -y figma-developer-mcp --stdio --env "$ENV_FILE"
