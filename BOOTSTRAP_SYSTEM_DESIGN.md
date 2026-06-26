# Bootstrap System Design

> Design doc for the one-command workspace initialization system
> Product: PlacementOS — "Your AI Placement Coach"

---

## 1. Purpose

Define how `bootstrap.ps1` detects, initializes, and recovers the multi-agent workspace so that agents load with full context on every workspace open.

---

## 2. Detection Flow

```
User opens workspace (VS Code / terminal)
                │
                ▼
       ┌────────────────┐
       │  bootstrap.ps1  │
       └────────┬───────┘
                │
        ┌───────┴───────┐
        ▼               ▼
  ┌──────────┐   ┌──────────────┐
  │ State    │   │ No state     │
  │ exists?  │   │ (fresh)      │
  └────┬─────┘   └──────┬───────┘
       │                │
       ▼                ▼
  ┌──────────┐   ┌──────────────┐
  │ Resume   │   │ Initialize   │
  │ session  │   │ workspace    │
  └──────────┘   └──────┬───────┘
       │                │
       └────────┬───────┘
                ▼
       ┌────────────────┐
       │ Open agent     │
       │ terminals      │
       └────────────────┘
```

---

## 3. Fresh Start Sequence

### Step 1: Create workspace directories

```
/workspace/
/workspace/agents/
/workspace/state/
```

### Step 2: Generate agent registry

Write `AGENTS.md` with the full 7-agent table. Each agent entry includes:
- Name and role
- Key responsibilities
- "Never" rules (boundaries)
- Startup prompt template reference

### Step 3: Generate context files

1. `PROJECT_CONTEXT.md` — static reference: product vision, tech stack, key constraints
2. `CURRENT_SPRINT.md` — sprint goal, stories in scope, deadline
3. `TASK_QUEUE.md` — initially populated from `DEVELOPMENT_BACKLOG.md` (Sprint 4 tasks)
4. `DECISIONS.md` — starts empty, grows as agents log decisions

### Step 4: Generate agent role cards

Each agent gets a role card in `/workspace/agents/`. Cards contain:
- Agent name + role
- Responsibilities (bullet list)
- "Never" rules
- Startup prompt (what agent reads and says on activation)

### Step 5: Record state

Write `workspace-state.json` with `initialized: true`.

### Step 6: Open agent terminals

For each of the 7 agents, create a separate terminal (PowerShell) with:
- Working directory set to project root
- A clear header showing agent name
- A startup message asking agent to load their role card and confirm

---

## 4. Resume Sequence

### Step 1: Read state

Load `workspace-state.json` and `last-session.json`.

### Step 2: Verify integrity

- Check all 7 agent role cards exist
- Check all shared files exist (`AGENTS.md`, `PROJECT_CONTEXT.md`, `CURRENT_SPRINT.md`, `TASK_QUEUE.md`, `DECISIONS.md`)
- If missing, recreate from templates (warn user)

### Step 3: Reopen agent terminals

For each agent that was active in `last-session.json`:
- Open terminal with agent name header
- Show startup message: "You are {role}. Load your role card and confirm readiness."

### Step 4: Restore open files

Open files listed in `last-session.json` `open_files` array in the editor.

---

## 5. Terminal Strategy

### 5.1 Why separate terminals per agent?

Each terminal represents one agent's "session". Agents never share a terminal because:
- Each agent has a unique context window
- Prompts differ per agent
- It prevents cross-agent contamination

### 5.2 Terminal naming convention

| Terminal Name | Content |
|---------------|---------|
| `[PM]` | Product Manager session |
| `[ARCH]` | System Architect session |
| `[FE]` | Frontend Engineer session |
| `[BE]` | Backend Engineer session |
| `[AI]` | AI Engineer session |
| `[QA]` | QA Engineer session |
| `[DEV]` | DevOps Engineer session |

### 5.3 Startup prompt format

Every terminal displays on open:

```
╔══════════════════════════════════════════════════╗
║  Agent: {Agent Name}                            ║
║  Role: {Role Title}                             ║
╠══════════════════════════════════════════════════╣
║  1. Read /workspace/AGENTS.md                   ║
║  2. Read your role card: /workspace/agents/{name}.md ║
║  3. Read /workspace/PROJECT_CONTEXT.md          ║
║  4. Read /workspace/CURRENT_SPRINT.md           ║
║  5. Read /workspace/TASK_QUEUE.md               ║
║  6. Confirm readiness: "Ready."                ║
╚══════════════════════════════════════════════════╝
```

---

## 6. Error Handling

| Scenario | Behavior |
|----------|----------|
| `/workspace/` missing | Create it fresh (warn user: "Workspace not found, initializing.") |
| Agent card missing | Recreate from template, log to console |
| State file corrupt | Warn and reinitialize state (preserve agent cards if they exist) |
| Permission denied on write | Error with clear message, abort |
| Terminal creation fails | Log which agent failed, continue with others |

---

## 7. PowerShell Constraints

Since the environment is Windows (PowerShell 5.1):

| Constraint | Mitigation |
|------------|------------|
| No `&&` chaining | Use `if ($?) { }` for conditional execution |
| No `Start-Process` reliable for new windows | Use `start` (alias for `Start-Process`) with `-NoNewWindow` for concurrency |
| Long path issues | Use absolute paths consistently, verify with `Test-Path` before writes |
| Encoding | Use UTF-8 with BOM for all `.md` and `.json` files |
| Execution policy | Script self-checks: `if (Get-ExecutionPolicy -Scope CurrentUser -eq 'Restricted') { Set-ExecutionPolicy -Scope CurrentUser RemoteSigned -Force }` |
