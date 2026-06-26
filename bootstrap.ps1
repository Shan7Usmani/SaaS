<#
.SYNOPSIS
  Bootstrap the PlacementOS Persistent Multi-Agent Workspace.
.DESCRIPTION
  Detects fresh vs resume state, initializes workspace files if needed,
  and opens 7 OpenCode terminal windows with pre-initialized AI agents.
.NOTES
  Version: 2.0.0
  Run: .\bootstrap.ps1
#>

$ErrorActionPreference = "Stop"
$script:ROOT_DIR = "C:\Users\Takhi\Desktop\Project\SaaS-Product"
$script:WORKSPACE_DIR = "$script:ROOT_DIR\workspace"
$script:AGENTS_DIR = "$script:WORKSPACE_DIR\agents"
$script:STATE_DIR = "$script:WORKSPACE_DIR\state"
$script:STATE_FILE = "$script:STATE_DIR\workspace-state.json"
$script:LAST_SESSION_FILE = "$script:STATE_DIR\last-session.json"
$script:AGENT_CONFIG_DIR = "$script:ROOT_DIR\.opencode\agents"

$script:AGENTS = @(
    @{ Codename = "pm";          Role = "Product Manager";     Display = "[PM]" },
    @{ Codename = "architect";   Role = "System Architect";    Display = "[ARCH]" },
    @{ Codename = "frontend";    Role = "Frontend Engineer";   Display = "[FE]" },
    @{ Codename = "backend";     Role = "Backend Engineer";    Display = "[BE]" },
    @{ Codename = "ai-engineer"; Role = "AI Engineer";         Display = "[AI]" },
    @{ Codename = "qa";          Role = "QA Engineer";         Display = "[QA]" },
    @{ Codename = "devops";      Role = "DevOps Engineer";     Display = "[DEV]" }
)

function DetectState {
    $stateFile = $script:STATE_FILE
    if (Test-Path $stateFile) {
        try {
            $content = Get-Content $stateFile -Raw -ErrorAction Stop
            $state = $content | ConvertFrom-Json
            if ($state.initialized -eq $true) {
                return "resume"
            }
        } catch {
            Write-Warning "State file corrupt. Reinitializing."
            return "fresh"
        }
    }
    return "fresh"
}

function Test-OpenCodeInstalled {
    try {
        $null = Get-Command opencode -ErrorAction Stop
        return $true
    } catch {
        return $false
    }
}

function OpenAgentTerminal {
    param(
        [string]$Codename,
        [string]$Role,
        [string]$Display
    )

    $agentFile = Join-Path $script:AGENT_CONFIG_DIR "$Codename.md"
    if (-not (Test-Path $agentFile)) {
        Write-Warning "Agent config missing: $agentFile. Skipping $Role."
        return
    }

    $title = "$Display $Role"
    $rootDir = $script:ROOT_DIR
    $promptMsg = "Run initialization sequence."

    $command = "`$Host.UI.RawUI.WindowTitle = '$title'; opencode '$rootDir' --agent $Codename --prompt '$promptMsg'"

    try {
        Start-Process powershell -ArgumentList "-NoExit", "-Command", $command -WindowStyle Normal
        Write-Host "  Launched $Role (agent: $Codename)" -ForegroundColor Green
    } catch {
        Write-Warning "  Failed to launch terminal for $Role ($Codename): $_"
    }
}

function InitializeWorkspace {
    Write-Host "Workspace Initialization" -ForegroundColor Cyan
    Write-Host ""

    $dirs = @($script:WORKSPACE_DIR, $script:AGENTS_DIR, $script:STATE_DIR, $script:AGENT_CONFIG_DIR)
    foreach ($d in $dirs) {
        if (-not (Test-Path $d)) {
            New-Item -ItemType Directory -Path $d -Force | Out-Null
            Write-Host "  Created $d" -ForegroundColor Green
        }
    }

    Write-Host ""
    Write-Host "Workspace directories ready." -ForegroundColor Yellow
}

function ResumeWorkspace {
    Write-Host "Workspace Resume" -ForegroundColor Cyan
    Write-Host ""

    $wd = $script:WORKSPACE_DIR
    $missing = @()
    if (-not (Test-Path (Join-Path $wd "AGENTS.md")))          { $missing += "AGENTS.md" }
    if (-not (Test-Path (Join-Path $wd "PROJECT_CONTEXT.md"))) { $missing += "PROJECT_CONTEXT.md" }
    if (-not (Test-Path (Join-Path $wd "CURRENT_SPRINT.md")))  { $missing += "CURRENT_SPRINT.md" }
    if (-not (Test-Path (Join-Path $wd "TASK_QUEUE.md")))      { $missing += "TASK_QUEUE.md" }
    if (-not (Test-Path (Join-Path $wd "DECISIONS.md")))       { $missing += "DECISIONS.md" }

    if ($missing.Count -gt 0) {
        Write-Warning "Missing files: $($missing -join ', ')"
        Write-Host "Run fresh initialization instead." -ForegroundColor Yellow
        return
    }

    $lastSession = $null
    $lastFile = $script:LAST_SESSION_FILE
    if (Test-Path $lastFile) {
        try {
            $raw = Get-Content $lastFile -Raw -ErrorAction Stop
            $lastSession = $raw | ConvertFrom-Json
        } catch {
            Write-Warning "Last session file corrupt. Opening all agents."
        }
    }

    $activeCodenames = if ($lastSession -and $lastSession.agents_active) {
        @($lastSession.agents_active)
    } else {
        $script:AGENTS | ForEach-Object { $_.Codename }
    }

    foreach ($codename in $activeCodenames) {
        $agent = $script:AGENTS | Where-Object { $_.Codename -eq $codename }
        if ($agent) {
            OpenAgentTerminal -Codename $agent.Codename -Role $agent.Role -Display $agent.Display
            Start-Sleep -Milliseconds 2000
        } else {
            Write-Warning "Unknown agent codename: $codename"
        }
    }

    Write-Host ""
    Write-Host "Workspace resumed ($($activeCodenames.Count) agents)" -ForegroundColor Green
}

function Main {
    if (-not (Test-OpenCodeInstalled)) {
        Write-Host "ERROR: OpenCode is not installed." -ForegroundColor Red
        Write-Host "Install it with: npm install -g opencode-ai" -ForegroundColor Yellow
        exit 1
    }

    $policy = Get-ExecutionPolicy -Scope CurrentUser
    if ($policy -eq "Restricted") {
        Write-Host "Setting execution policy to RemoteSigned..." -ForegroundColor Yellow
        Set-ExecutionPolicy -Scope CurrentUser RemoteSigned -Force
    }

    $state = DetectState
    Write-Host "State: $state" -ForegroundColor Magenta
    Write-Host ""

    if ($state -eq "fresh") {
        InitializeWorkspace
    }

    ResumeWorkspace

    Write-Host ""
    Write-Host "All 7 agents launched." -ForegroundColor Green
    Write-Host "Each terminal will auto-initialize its AI agent." -ForegroundColor Green
    Write-Host "Press any key to close this window..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

Main
