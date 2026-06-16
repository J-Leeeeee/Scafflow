# Figma MCP with Claude Code

This repo ships a **project-scoped** Figma MCP server in [`.mcp.json`](../.mcp.json). Claude Code reads that file when you start a session in this directory.

## Prerequisites

1. **Claude Code** installed and signed in  
   - Install: https://code.claude.com/docs/en/quickstart  
   - Verify: `claude --version`

2. **Node.js 18+** (for `npx`)

3. **Figma Personal Access Token** in [`.env`](../.env):
   ```bash
   FIGMA_API_KEY=figd_...
   ```
   Create one at Figma → Settings → Security → Personal access tokens.  
   Scope needed: **File content** (read).

4. **Access to the design file**  
   - File key: `qWB8UPBr4Us99ABkRspWRQ` ("Profile Prototypes (Copy)")

## One-time setup

### 1. Set your token

Copy from [`.env.example`](../.env.example) if needed:

```bash
cp .env.example .env
# Edit .env and set FIGMA_API_KEY=
```

### 2. Start Claude Code from the repo root

```bash
cd /path/to/Scafflow-1
claude
```

Claude Code loads `.mcp.json` at session start. **Restart the session** after editing that file.

### 3. Approve the project MCP server

The first time you use a project-scoped server, Claude Code prompts for approval (security gate).

- Approve when prompted, **or**
- Inside a session, run `/mcp` → select **figma** → approve

If you previously rejected it:

```bash
claude mcp reset-project-choices
```

### 4. Verify the connection

From your shell (outside a `claude` session):

```bash
claude mcp list
```

You want `figma` with status **Connected**.

Inside a session:

```text
/mcp
```

Select **figma** — you should see tools like `get_figma_data` and `download_figma_images`.

## Using Figma in a session

1. In Figma, select a **single frame** (not a whole section).
2. Copy link → URL looks like:
   ```
   https://www.figma.com/design/qWB8UPBr4Us99ABkRspWRQ/...?node-id=113-2
   ```
3. In Claude Code, paste the URL and ask for implementation, e.g.:
   ```text
   Use the figma MCP server on this frame and implement it as a React route:
   https://www.figma.com/design/qWB8UPBr4Us99ABkRspWRQ/...?node-id=113-2
   ```

**Node ID rule:** convert `node-id=113-2` → `113:2` when calling tools manually.

### Known dashboard frames (from HANDOFF)

| Screen | Node ID |
|--------|---------|
| Dashboard variant 1 | `113:2` |
| Dashboard variant 2 | `113:204` |
| Dashboard variant 3 | `113:406` |

Use `depth: 3` only for cataloging; use the exact frame node for code generation.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `claude: command not found` (Git Bash / MINGW64) | Claude is often at `%USERPROFILE%\.local\bin\claude.exe`. Add to `~/.bashrc`: `export PATH="$HOME/.local/bin:$PATH"`, then `source ~/.bashrc` or open a new terminal. Or run `"$HOME/.local/bin/claude.exe"` directly. |
| `claude: command not found` (PowerShell) | Close and reopen the terminal after install. If still missing, add `$env:USERPROFILE\.local\bin` to your **User** PATH in Windows Settings → Environment Variables. |
| `No MCP servers configured` | Start `claude` from the **repo root** (where `.mcp.json` lives). |
| `Failed to connect` on first run | Wait for `npx` to download `figma-developer-mcp`, then run `claude mcp list` again. |
| `Connection timed out` | `MCP_TIMEOUT=60000 claude` (PowerShell: `$env:MCP_TIMEOUT="60000"; claude`) |
| Server connects, tools fail with 403 | Check `FIGMA_API_KEY` in `.env` and file access in Figma. |
| Changes to `.mcp.json` ignored | Exit and restart the Claude Code session. |
| `Pending approval` | Run `/mcp` and approve, or `claude mcp reset-project-choices` |

### Manual server test (optional)

From repo root:

```bash
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}' \
  | npx -y figma-developer-mcp --stdio --env .env
```

You should see a JSON `initialize` response with `"name":"Figma MCP Server"`.

## Alternative: CLI add (local scope)

If you prefer not to use the committed `.mcp.json`, add the server locally:

```bash
claude mcp add figma -- npx -y figma-developer-mcp --stdio --env .env
```

That writes to `~/.claude.json` under this project path instead of sharing via git.

## Config reference

Project [`.mcp.json`](../.mcp.json):

```json
{
  "mcpServers": {
    "figma": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "figma-developer-mcp", "--stdio", "--env", ".env"]
    }
  }
}
```

The token stays in `.env` (gitignored), not in the config file.

Legacy wrapper [scripts/figma-mcp.sh](../scripts/figma-mcp.sh) still works for other MCP clients (e.g. Cursor) that call a shell script directly.
