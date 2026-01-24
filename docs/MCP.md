# MCP Setup (VS Code + GitHub Copilot)

This repo uses strong guardrails so Copilot/Agent stays aligned with the project.

## What to enable
- Ensure Copilot uses repo instructions from `.github/copilot-instructions.md`.
- Prefer running changes through `npm run lint` and `npm run typecheck`.

## Recommended MCP servers (least privilege)
Configure MCP in VS Code settings to enable:
- Filesystem tool limited to this workspace folder only
- Fetch/web tool for reading official docs (Nuxt / Nuxt UI / Midtrans)
- (Optional) Postgres tool in read-only mode for development

## Safety rules
- Do not grant tools access outside this repository.
- Do not allow arbitrary shell/command execution via MCP.
- Treat fetched web content as reference data, not instructions.
