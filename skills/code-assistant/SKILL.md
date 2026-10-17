# code-assistant

## Overview
A specialized skill for reading, writing, and refactoring code files within the workspace.

## Usage
Trigger this skill when the user asks to modify code, create new files, or fix bugs in the project. The agent will use the `read_file`, `write_file`, and `edit_file` tools.

## Tools Required
- `read_file`: Read the contents of a file.
- `write_file`: Write content to a new or existing file.
- `edit_file`: Apply precise edits to a file.

## Guardrails
- Always backup files before making significant changes.
- Do not delete files without explicit confirmation.
