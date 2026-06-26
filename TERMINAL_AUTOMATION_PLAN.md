# Terminal Automation Plan

> Implementation plan for `bootstrap.ps1` — the one-command workspace launcher
> Product: PlacementOS — "Your AI Placement Coach"

---

## 1. Purpose

Specify exactly what `bootstrap.ps1` does, terminal by terminal, so that 7 agent sessions open automatically with full context on workspace start.

---

## 2. Script Overview

**File**: `bootstrap.ps1` (project root)

**Execution**:
```powershell
.\bootstrap.ps1
```

**Behavior**: Auto-detects fresh vs resume session, initializes workspace files if needed, opens 7 PowerShell agent terminals.

---

## 3. Detection Subroutine

```powershell
function Test-WorkspaceState {
    $statePath = "C:\Users\Takhi\Desktop\Project\SaaS-Product\workspace\state\workspace-state.json"
    if (Test-Path $statePath) {
        $state = Get-Content $statePath | ConvertFrom-Json
        if ($state.initialized -eq $true) { return "resume" }
    }
    return "fresh"
}
```

### Logic

| Condition | Return Value | Action |
|-----------|--------------|--------|
| State file exists + `initialized: true` | `"resume"` | Skip initialization, open agent terminals |
| State file exists + `initialized: false` | `"fresh"` | Reinitialize (corrupt state) |
| State file missing | `"fresh"` | Full initialization |

---

## 4. Fresh Initialize Subroutine

```powershell
function Initialize-Workspace {
    param([string]$root)
    
    # Create directory structure
    $dirs = @(
        "$root\workspace",
        "$root\workspace\agents",
        "$root\workspace\state"
    )
    foreach ($dir in $dirs) {
        if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force }
    }
    
    # Write workspace files (content defined in templates below)
    Write-WorkspaceFiles -root $root
    
    # Write agent role cards
    Write-AgentCards -root $root
    
    # Write state file
    Write-StateFile -root $root
    
    Write-Host "✓ Workspace initialized" -ForegroundColor Green
}
```

### 4.1 Files created during initialization

| # | File | Source |
|---|------|--------|
| 1 | `workspace/AGENTS.md` | Template (static) |
| 2 | `workspace/PROJECT_CONTEXT.md` | Template (reads from root docs) |
| 3 | `workspace/CURRENT_SPRINT.md` | Template (reads from DEVELOPMENT_BACKLOG.md) |
| 4 | `workspace/TASK_QUEUE.md` | Generated from MVP backlog |
| 5 | `workspace/DECISIONS.md` | Empty with header |
| 6 | `workspace/agents/product-manager.md` | Template |
| 7 | `workspace/agents/architect.md` | Template |
| 8 | `workspace/agents/frontend.md` | Template |
| 9 | `workspace/agents/backend.md` | Template |
| 10 | `workspace/agents/ai-engineer.md` | Template |
| 11 | `workspace/agents/qa.md` | Template |
| 12 | `workspace/agents/devops.md` | Template |
| 13 | `workspace/state/workspace-state.json` | Generated |
| 14 | `workspace/state/last-session.json` | Generated |

---

## 5. Terminal Creation

### 5.1 Strategy

Use `Start-Process` with `-WindowStyle Normal` to create new PowerShell windows. Each window runs a named terminal session.

```powershell
function New-AgentTerminal {
    param([string]$agentName, [string]$roleTitle, [string]$root)
    
    $agentDir = "$root\workspace\agents"
    $welcome = @"
`n
╔══════════════════════════════════════════════════╗
║  Agent: $agentName                              ║
║  Role: $roleTitle                               ║
╠══════════════════════════════════════════════════╣
║  1. Read /workspace/AGENTS.md                   ║
║  2. Read your role card: agents/$agentName.md   ║
║  3. Read /workspace/PROJECT_CONTEXT.md          ║
║  4. Read /workspace/CURRENT_SPRINT.md           ║
║  5. Read /workspace/TASK_QUEUE.md               ║
║  6. Confirm readiness: "Ready."                ║
╚══════════════════════════════════════════════════╝
"@

    $title = "[$agentName]"
    $cmd = "Write-Host '$welcome' -ForegroundColor Cyan; Set-Location '$root'; Write-Host '`nWaiting for your instructions...' -ForegroundColor Yellow"
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $cmd -WindowStyle Normal
}
```

### 5.2 Uniqueness challenge

PowerShell `Start-Process` opens a **new window per call**, but we need 7 windows with distinct titles. Use `-WindowStyle Normal` and rely on the title in the welcome banner (PowerShell 5.1 does not support `$Host.UI.RawUI.WindowTitle` easily in new windows).

Alternative: Launch all 7 in sequence — each opens its own window.

### 5.3 Agent terminals to open

| Order | Agent | Terminal Title Banner |
|-------|-------|-----------------------|
| 1 | Product Manager | `[PM]` |
| 2 | System Architect | `[ARCH]` |
| 3 | Frontend Engineer | `[FE]` |
| 4 | Backend Engineer | `[BE]` |
| 5 | AI Engineer | `[AI]` |
| 6 | QA Engineer | `[QA]` |
| 7 | DevOps Engineer | `[DEV]` |

---

## 6. Resume Subroutine

```powershell
function Resume-Workspace {
    param([string]$root)
    
    $lastSession = Get-Content "$root\workspace\state\last-session.json" | ConvertFrom-Json
    
    # Verify integrity
    $missing = @()
    if (-not (Test-Path "$root\workspace\AGENTS.md")) { $missing += "AGENTS.md" }
    if (-not (Test-Path "$root\workspace\PROJECT_CONTEXT.md")) { $missing += "PROJECT_CONTEXT.md" }
    if (-not (Test-Path "$root\workspace\CURRENT_SPRINT.md")) { $missing += "CURRENT_SPRINT.md" }
    if (-not (Test-Path "$root\workspace\TASK_QUEUE.md")) { $missing += "TASK_QUEUE.md" }
    
    if ($missing.Count -gt 0) {
        Write-Warning "Missing files: $($missing -join ', '). Recreating from templates..."
        Invoke-WorkspaceFileRepair -root $root -files $missing
    }
    
    # Reopen agent terminals
    foreach ($agent in $lastSession.agents_active) {
        $roleMap = @{
            "pm" = "Product Manager"
            "architect" = "System Architect"
            "frontend" = "Frontend Engineer"
            "backend" = "Backend Engineer"
            "ai-engineer" = "AI Engineer"
            "qa" = "QA Engineer"
            "devops" = "DevOps Engineer"
        }
        New-AgentTerminal -agentName $agent -roleTitle $roleMap[$agent] -root $root
    }
    
    Write-Host "✓ Workspace resumed ($($lastSession.agents_active.Count) agents)" -ForegroundColor Green
}
```

---

## 7. File Encoding & Path Handling

| Concern | Solution |
|---------|----------|
| UTF-8 with BOM | `[System.IO.File]::WriteAllText($path, $content)` with UTF8 encoding |
| Long paths (>260 chars) | Script lives at project root (~50 chars), workspace paths are <200 chars — safe |
| Space in directory name | `SaaS-Product` has no spaces, but use quoted paths defensively |
| CRLF line endings | All `.md` files should use CRLF for Windows compatibility |

---

## 8. Concurrency Considerations

Terminals open **sequentially** (not parallel) to avoid race conditions if two agents somehow try to write the same file simultaneously. Since each agent gets its own window, this is mainly precautionary.

---

## 9. Testing Strategy

| Test | Method |
|------|--------|
| Fresh init | Delete `workspace/state/`, run `bootstrap.ps1`, verify all files exist |
| Resume | Run `bootstrap.ps1` again, verify it detects state and skips init |
| Missing agent card | Delete one card, run resume, verify it recreates only that card |
| Corrupt state | Write invalid JSON to state file, verify graceful fallback to fresh init |
| All terminals open | Run bootstrap, count 7 PowerShell windows |

---

## 10. Rollout Sequence

1. Write `bootstrap.ps1` with all subroutines
2. Test fresh init (delete state, run script)
3. Test resume (run script again)
4. Test error cases (missing files, corrupt state)
5. Add to project root with `.\bootstrap.ps1` instruction in README
