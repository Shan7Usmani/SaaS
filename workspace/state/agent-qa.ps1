Write-Host 'â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•' -ForegroundColor Cyan
Write-Host 'Agent: qa (QA Engineer)' -ForegroundColor Cyan
Write-Host 'â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•' -ForegroundColor Cyan
Write-Host ''
Write-Host '--- Loading role registry ---' -ForegroundColor Green
Get-Content 'C:\Users\Takhi\Desktop\Project\SaaS-Product\workspace\AGENTS.md' -Encoding UTF8 | Write-Host -ForegroundColor Gray
Write-Host ''
Write-Host '--- Loading role card ---' -ForegroundColor Green
Get-Content 'C:\Users\Takhi\Desktop\Project\SaaS-Product\workspace\agents\qa.md' -Encoding UTF8 | Write-Host -ForegroundColor Gray
Write-Host ''
Write-Host '--- Loading project context ---' -ForegroundColor Green
Get-Content 'C:\Users\Takhi\Desktop\Project\SaaS-Product\workspace\PROJECT_CONTEXT.md' -Encoding UTF8 | Write-Host -ForegroundColor Gray
Write-Host ''
Write-Host '--- Loading current sprint ---' -ForegroundColor Green
Get-Content 'C:\Users\Takhi\Desktop\Project\SaaS-Product\workspace\CURRENT_SPRINT.md' -Encoding UTF8 | Write-Host -ForegroundColor Gray
Write-Host ''
Write-Host '--- Loading task queue ---' -ForegroundColor Green
Get-Content 'C:\Users\Takhi\Desktop\Project\SaaS-Product\workspace\TASK_QUEUE.md' -Encoding UTF8 | Write-Host -ForegroundColor Gray
Write-Host ''
Write-Host '--- Loading decisions ---' -ForegroundColor Green
Get-Content 'C:\Users\Takhi\Desktop\Project\SaaS-Product\workspace\DECISIONS.md' -Encoding UTF8 | Write-Host -ForegroundColor Gray
Write-Host ''
Set-Location 'C:\Users\Takhi\Desktop\Project\SaaS-Product'
Write-Host 'Ready.' -ForegroundColor Green