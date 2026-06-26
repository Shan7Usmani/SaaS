# Agent Registry — PlacementOS

> Master registry of all 7 agents in the Persistent Multi-Agent Workspace System
> Version: 1.0.0 | Updated: 2026-06-09

---

## Roles

| # | Agent | Codename | Key Deliverable | Boundary ("Never") |
|---|-------|----------|-----------------|--------------------|
| 1 | Product Manager | `pm` | Sprint plans, requirements, task queue | Never write implementation code |
| 2 | System Architect | `architect` | Design docs, architecture decisions | Never write implementation code |
| 3 | Frontend Engineer | `frontend` | UI components, pages, styling | Never modify API routes or DB schema |
| 4 | Backend Engineer | `backend` | API routes, DB migrations, middleware | Never modify frontend pages or components |
| 5 | AI Engineer | `ai-engineer` | AI prompts, model config, embedding logic | Never change system architecture or DB schema |
| 6 | QA Engineer | `qa` | Test plans, test cases, bug reports | Never write production code |
| 7 | DevOps Engineer | `devops` | CI/CD, deployment, monitoring config | Never change application logic |

## Startup Sequence (all agents)

1. Read this file (`/workspace/AGENTS.md`)
2. Read your role card (`/workspace/agents/{codename}.md`)
3. Read `/workspace/PROJECT_CONTEXT.md`
4. Read `/workspace/CURRENT_SPRINT.md`
5. Read `/workspace/TASK_QUEUE.md`
6. Read `/workspace/DECISIONS.md` (tail)
7. Confirm readiness: output `"Ready. I am {role}."`

## Communication Protocol

- **No direct messages between agents**
- Write decisions to `DECISIONS.md`
- Update task status in `TASK_QUEUE.md`
- Read others' updates on next session
