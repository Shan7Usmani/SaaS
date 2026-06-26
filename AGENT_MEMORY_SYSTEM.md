# Agent Memory System

> Design doc for agent context persistence across sessions
> Product: PlacementOS — "Your AI Placement Coach"

---

## 1. Purpose

Define how each of the 7 agents retains knowledge of their role, current tasks, and project context across LLM sessions (i.e., when a new conversation is started on workspace open).

---

## 2. Core Insight

LLM agents have **zero inherent memory**. Every new session is a blank slate. The memory system must therefore be **file-based**: all context an agent needs must be written to disk and re-read on activation.

---

## 3. Three-Layer Memory Model

```
Layer 1: Identity (static)       → Role card + AGENTS.md
Layer 2: Context (semi-static)   → PROJECT_CONTEXT.md + CURRENT_SPRINT.md
Layer 3: State (dynamic)         → TASK_QUEUE.md + DECISIONS.md
```

### Layer 1 — Identity

Read on every session start. Never changes between sessions (unless role is updated):

- `/workspace/AGENTS.md` — master registry with all agent definitions
- `/workspace/agents/{name}.md` — that agent's specific role card

**Content**: Name, role, responsibilities, "never" rules, startup prompt.

### Layer 2 — Context

Read on every session start. Changes only when the project context or sprint changes:

- `/workspace/PROJECT_CONTEXT.md` — product vision, tech stack, architecture constraints, file structure map
- `/workspace/CURRENT_SPRINT.md` — sprint number, goal, stories, deadlines, featured tasks

### Layer 3 — State

Read on every session start. Changes continuously as work progresses:

- `/workspace/TASK_QUEUE.md` — all tasks with status, owner, priority, dependencies
- `/workspace/DECISIONS.md` — chronological decision log

---

## 4. Agent Startup Sequence

When an agent terminal opens, the agent must execute this exact sequence:

```
Step 1: Read /workspace/AGENTS.md          → Confirm role exists in registry
Step 2: Read /workspace/agents/{name}.md   → Load role-specific instructions
Step 3: Read /workspace/PROJECT_CONTEXT.md → Understand product and tech
Step 4: Read /workspace/CURRENT_SPRINT.md  → Know what we're building this sprint
Step 5: Read /workspace/TASK_QUEUE.md      → See what work is available
Step 6: Read /workspace/DECISIONS.md       → Learn past decisions (tail)
```

After reading, the agent outputs:

```
Ready. I am {role}. I have loaded my context.
Current task: {task title or "No task assigned"}
```

---

## 5. Memory Across Sessions

### 5.1 What persists

| Data | Where | Persistence |
|------|-------|-------------|
| Agent identity & rules | `agents/*.md`, `AGENTS.md` | Permanent |
| Tech stack & vision | `PROJECT_CONTEXT.md` | Permanent (manual update on change) |
| Sprint goal & scope | `CURRENT_SPRINT.md` | Weekly (PM updates) |
| Task status & ownership | `TASK_QUEUE.md` | Continuous (agents update in real time) |
| Decisions made | `DECISIONS.md` | Continuous (appended) |
| Last session snapshot | `state/last-session.json` | Every session end |

### 5.2 What is lost

| Data | Why |
|------|-----|
| LLM conversation history | Inherent to LLM architecture |
| Temporary notes / scratch | Not written to workspace files |
| Error stack traces (non-critical) | Not logged to workspace files |

### 5.3 Mitigating lost context

Agents should write important findings to `DECISIONS.md` or `TASK_QUEUE.md` **immediately**, not at session end. This way, even if a session crashes, the data is persisted.

---

## 6. File Update Rules

| File | Who Can Write | How |
|------|---------------|-----|
| `AGENTS.md` | PM (after Architect approval) | Edit file directly |
| `PROJECT_CONTEXT.md` | Architect | Edit file directly |
| `CURRENT_SPRINT.md` | PM | Edit file directly |
| `TASK_QUEUE.md` | Any agent (own tasks) | Append/update rows |
| `DECISIONS.md` | Any agent | Append new entry |
| `agents/*.md` | Each agent (their own card) | Edit their own card |
| `state/*.json` | Bootstrap script only | Never edited by agents |

---

## 7. Recovery Scenarios

### Scenario A: Agent finds no TASK_QUEUE.md

```
Action: Create an empty task queue with header only.
Log: "TASK_QUEUE.md was missing. Created empty queue."
```

### Scenario B: Agent reads stale CURRENT_SPRINT.md

```
Detection: Sprint dates are in the past.
Action: PM agent creates new sprint. Other agents wait for PM.
Log: "Sprint {N} appears to have ended. Holding for PM update."
```

### Scenario C: Conflicting TASK_QUEUE.md edits

```
Mitigation: Task queue uses fixed-width markdown table.
Two agents should never edit the same row simultaneously.
If a task is claimed, set status to 'assigned' immediately.
```

### Scenario D: Agent role card missing

```
Detection: /workspace/agents/{name}.md does not exist.
Action: Agent reads AGENTS.md for role info, operates with reduced context.
Log: "Role card missing. Operating from AGENTS.md registry entry."
```
