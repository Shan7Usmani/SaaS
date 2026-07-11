"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, Sparkles, Lightbulb, ArrowUp } from "lucide-react"

interface AnalysisResult {
  score: number
  ats: number
  keywords: number
  projects: number
  skills: number
  missing: string[]
  suggestions: Suggestion[]
  weakSections: string[]
}

interface Suggestion {
  priority: "high" | "medium" | "low"
  category: string
  issue: string
  fix: string
  impact: string
}

interface ResumeResultsProps {
  result: AnalysisResult
  onReset: () => void
}

const priorityColor = {
  high: "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800",
  medium: "bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800",
  low: "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800",
}

const priorityBadge = {
  high: "destructive" as const,
  medium: "secondary" as const,
  low: "outline" as const,
}

export function ResumeResults({ result, onReset }: ResumeResultsProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-5">
        {[
          { label: "Overall", value: result.score },
          { label: "ATS Score", value: result.ats },
          { label: "Keywords", value: result.keywords },
          { label: "Projects", value: result.projects },
          { label: "Skills", value: result.skills },
        ].map((item) => (
          <Card key={item.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium">{item.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}/100</div>
              <Progress
                value={item.value}
                className="mt-2 h-2"
                indicatorClassName={
                  item.value >= 70
                    ? "bg-emerald-500"
                    : item.value >= 40
                      ? "bg-amber-500"
                      : "bg-red-500"
                }
              />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Missing Keywords
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result.missing.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {result.missing.map((kw) => (
                  <Badge key={kw} variant="secondary" className="text-xs">
                    {kw}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No missing keywords found</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Weak Sections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.weakSections.map((section, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                  {section}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {result.suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-violet-500" />
              Improvement Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {result.suggestions.map((s, i) => (
              <div
                key={i}
                className={`rounded-lg border p-4 ${priorityColor[s.priority]}`}
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {s.priority === "high" ? (
                      <ArrowUp className="h-4 w-4 shrink-0 text-red-500" />
                    ) : (
                      <Lightbulb className="h-4 w-4 shrink-0 text-amber-500" />
                    )}
                    <span className="font-medium text-sm">{s.issue}</span>
                  </div>
                  <Badge variant={priorityBadge[s.priority]} className="shrink-0 text-[10px]">
                    {s.priority}
                  </Badge>
                </div>
                <p className="text-muted-foreground ml-6 text-sm">{s.fix}</p>
                {s.impact && (
                  <div className="ml-6 mt-1.5 flex items-center gap-1.5">
                    <span className="h-1 w-1 rounded-full bg-emerald-500" />
                    <span className="text-emerald-600 text-xs font-medium dark:text-emerald-400">
                      {s.impact}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        <button
          onClick={onReset}
          className="border-border text-foreground hover:bg-muted rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
        >
          Analyze Another
        </button>
      </div>
    </div>
  )
}
