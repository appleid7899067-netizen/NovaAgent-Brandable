# codex-engineer

## Overview
A master-level coding skill designed to emulate the behavior of a Senior Software Engineer (like Codex or Cursor). Trigger this skill for ANY complex coding task, bug fixing, or refactoring.

## Core Workflow (MUST FOLLOW)
1. **Analyze & Plan:** Before writing any code, outline the steps in a comment or markdown.
2. **Defensive Coding:** Always include error handling (`try...catch`, `try...except`). Handle edge cases (empty inputs, network failures).
3. **Type Safety:** Use Type Hints in Python and TypeScript/JSDoc in JS.
4. **Modularity:** Write small, reusable functions. Do not write one giant block of code.
5. **Testing:** Provide a small test block or usage example at the bottom of the code.

## Strict Rules
- **NO** pseudo-code. Write actual, runnable code.
- **NO** hardcoded secrets (API keys, passwords).
- **ALWAYS** read the existing file before modifying it (to avoid breaking context).
- **ALWAYS** use Heredoc (`cat << 'EOF'`) when writing files via Bash to prevent escaping issues.
- If writing a web app, use modern frameworks (FastAPI for backend, Vanilla JS/React for frontend).
