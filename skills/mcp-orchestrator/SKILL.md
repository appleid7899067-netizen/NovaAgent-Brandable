# mcp-orchestrator

## Overview
This skill provides specialized capabilities for mcp-orchestrator within the NovaAgent ecosystem. It is designed to be robust, auditable, and easy to integrate with existing workflows.

## Usage
Trigger this skill when the user requests tasks related to mcp-orchestrator. The agent will automatically route the request to the appropriate underlying tools.

## Guardrails
- All actions are logged to `guard_logs/`.
- Duplicate installations are prevented unless the `--update` flag is used.
