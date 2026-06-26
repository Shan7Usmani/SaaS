# Workspace Architecture

> Design doc for the Persistent Multi-Agent Workspace System
> Product: PlacementOS — "Your AI Placement Coach"

---

## 1. Purpose

Define the physical and logical structure of the `/workspace` directory so that 7 AI agents can persist, recover, and collaborate across sessions without manual intervention.

---

## 2. Directory Structure

```
/workspace/
├── AGENTS.md                  # Master registry: all 7 agents, roles, "never" rules
├── PROJECT_CONTEXT.md         # Immutable reference: vision, tech stack, constraints
├── CURRENT_SPRINT.md          # Sprint scope: goals, stories, deadlines
├── TASK_QUEUE.md              # Live task board: status, owner, priority, dependencies
├── DECISIONS.md               # Decision log: ADR-style entries with context and rationale
├── agents/
│   ├── product-manager.md     # Role card for PM agent
│   ├── architect.md           # Role card for Architect agent
│   ├── frontend.md            # Role card for Frontend agent
│   ├── backend.md             # Role card for Backend agent
│   ├── ai-engineer.md         # Role card for AI Engineer agent
│   ├── qa.md                  # Role card for QA Engineer agent
│   └── devops.md              # Role card for DevOps Engineer agent
└── state/
    ├── workspace-state.json   # Bootstrap detects state from here
    └── last-session.json      # Snapshot of last session's open files / agents
```

### 2.1 Root vs `next-app/` vs `workspace/`

| Directory | Purpose |
|-----------|---------|
| `/` (root) | Product docs, design docs, bootstrap script |
| `next-app/` | Next.js 16 implementation |
| `workspace/` | Agent orchestration, context, state |

### 2.2 File Ownership

| File | Owner (writes) | Readers | Update Frequency |
|------|----------------|---------|-----------------|
| `AGENTS.md` | Architect (initial), then PM (updates) | All agents | On role changes |
| `PROJECT_CONTEXT.md` | Architect | All agents | Rare (tech stack changes) |
| `CURRENT_SPRINT.md` | PM | All agents | Weekly (sprint start) |
| `TASK_QUEUE.md` | PM + all agents | All agents | Daily (task updates) |
| `DECISIONS.md` | Any agent (self-serve) | All agents | As decisions are made |
| `agents/*.md` | Each agent owns their own card | All agents | On role changes |
| `state/` | Bootstrap script | Bootstrap script | Every session open |

---

## 3. Agent Communication Protocol

Agents do **not** message each other directly. Instead:

```
Agent A writes → TASK_QUEUE.md (updates task status)
Agent A writes → DECISIONS.md (logs architecture/design decisions)
Agent B reads  → TASK_QUEUE.md (picks up next task)
Agent B reads  → DECISIONS.md (understands context)
```

### 3.1 Task Lifecycle

```
pending → assigned → in_progress → review → done
                                  → blocked
```

- **pending**: In queue, no owner
- **assigned**: Owner claimed via `assigned_to` field
- **in_progress**: Working
- **review**: Done, needs QA or architect sign-off
- **done**: Completed
- **blocked**: Stuck, reason recorded

### 3.2 Decision Logging

Any agent can add to `DECISIONS.md` using this format:

```markdown
## YYYY-MM-DD: Title
- **Context**: Why this decision was needed
- **Decision**: What was decided
- **Rationale**: Why this option over alternatives
- **Owner**: Agent name
```

### 3.3 Handoff Protocol

When an agent completes a task that needs another agent's input:

1. Update `TASK_QUEUE.md` — mark current task `review` or `done`
2. If follow-up exists, create a new task entry with `depends_on` referencing the completed task
3. The dependent agent reads `TASK_QUEUE.md` on next load and picks up

---

## 4. Agent Roles Summary

| Agent | Key Deliverables | Never |
|-------|-----------------|-------|
| Product Manager | Sprint plans, task queue, requirements | Never writes implementation code |
| System Architect | Design docs, architecture decisions | Never writes implementation code |
| Frontend Engineer | UI components, pages, styling | Never modifies API routes or DB schema |
| Backend Engineer | API routes, DB migrations, middleware | Never modifies frontend pages or components |
| AI Engineer | AI prompts, model config, embedding logic | Never changes system architecture or DB schema |
| QA Engineer | Test plans, test cases, bug reports | Never writes production code |
| DevOps Engineer | CI/CD, deployment, monitoring config | Never changes application logic |

---

## 5. State Persistence

### 5.1 Session Detection

On workspace open, `bootstrap.ps1` checks:

1. Does `/workspace/state/workspace-state.json` exist?
2. Does `/workspace/state/last-session.json` exist?

### 5.2 Fresh vs Resume

| Condition | Action |
|-----------|--------|
| No state files exist | **Fresh start**: Create workspace files, assign all roles, open terminals |
| State files exist | **Resume**: Read last-session, restore agent terminals, load context |

### 5.3 `workspace-state.json` Schema

```json
{
  "version": "1.0.0",
  "created_at": "2026-06-09T12:00:00Z",
  "last_modified": "2026-06-09T12:00:00Z",
  "initialized": true,
  "agent_count": 7,
  "product_phase": "mvp-stabilization"
}
```

### 5.4 `last-session.json` Schema

```json
{
  "version": "1.0.0",
  "last_opened": "2026-06-09T12:00:00Z",
  "agents_active": ["pm", "architect", "frontend", "backend", "ai-engineer", "qa", "devops"],
  "open_files": [
    "/workspace/TASK_QUEUE.md",
    "/workspace/CURRENT_SPRINT.md"
  ],
  "sprint": "Sprint 4"
}
```

---

## 6. Tech Stack Reference

| Component | Technology |
|-----------|------------|
| Framework | Next.js 16 |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| UI Library | ShadCN UI (Base UI + Radix) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (GoTrue) |
| Storage | Supabase Storage (signed URLs) |
| AI | Gemini (roadmap, resume), OpenAI (interview) |
| Deployment | Vercel |
| Monitoring | Sentry |
| Version Control | GitHub |
| Package Manager | npm |
