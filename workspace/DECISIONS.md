# Decision Log — PlacementOS

> Architectural Decision Record (ADR). Agents append as decisions are made.
> First entry: 2026-06-09

---

## 2026-06-09: Workspace Architecture

- **Context**: Needed a persistent multi-agent workspace so that 7 AI agents can recover roles, context, and tasks across sessions.
- **Decision**: Created `/workspace/` directory with shared context files (`AGENTS.md`, `PROJECT_CONTEXT.md`, `CURRENT_SPRINT.md`, `TASK_QUEUE.md`, `DECISIONS.md`) and role-specific cards in `/workspace/agents/`. Bootstrap via `bootstrap.ps1`.
- **Rationale**: File-based persistence is the simplest approach that works with stateless LLM agents. No database or server needed for agent state.
- **Owner**: System Architect

## 2026-06-09: Bootstrap Detection

- **Context**: Script needs to know if this is a fresh workspace or a resume.
- **Decision**: Use `workspace/state/workspace-state.json` with `initialized: boolean` as the detection mechanism.
- **Rationale**: Simple JSON file check — no env vars, no CLI args, no magic.
- **Owner**: System Architect

## 2026-06-09: Agent Communication

- **Context**: Agents need to hand off work and share context without direct messaging.
- **Decision**: Agents communicate exclusively through shared files — `TASK_QUEUE.md` for task status and `DECISIONS.md` for decisions. No cross-agent messaging protocol.
- **Rationale**: File-based handoff is inspectable, auditable, and survives session restarts. Agents are stateless — they can't "receive" messages anyway.
- **Owner**: System Architect

## 2026-06-09: Separate Terminals per Agent

- **Context**: Each agent needs an isolated session with its own context window.
- **Decision**: Bootstrap opens 7 separate PowerShell windows, each with a unique header banner showing the agent name and startup instructions.
- **Rationale**: Shared terminals mix agent contexts. Separate windows enforce isolation and make it clear which agent is "speaking."
- **Owner**: System Architect
