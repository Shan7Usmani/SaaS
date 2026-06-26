"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, XCircle, TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface QuestionResult {
  question: string
  answer: string
  score: number
  feedback: string
}

interface InterviewSummaryProps {
  totalScore: number
  questions: QuestionResult[]
  onRestart: () => void
  onBack: () => void
}

export function InterviewSummary({ totalScore, questions, onRestart, onBack }: InterviewSummaryProps) {
  const avgScore = Math.round(questions.reduce((sum, q) => sum + q.score, 0) / questions.length)
  const strengths = questions.filter((q) => q.score >= 7)
  const weaknesses = questions.filter((q) => q.score < 5)

  const scoreColor =
    totalScore >= 70 ? "text-emerald-500" : totalScore >= 40 ? "text-amber-500" : "text-red-500"

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div
          className={cn(
            "h-2",
            totalScore >= 70 ? "bg-emerald-500" : totalScore >= 40 ? "bg-amber-500" : "bg-red-500"
          )}
        />
        <CardContent className="flex flex-col items-center py-8 text-center">
          <div className={cn("text-6xl font-extrabold tracking-tight", scoreColor)}>
            {totalScore}%
          </div>
          <p className="text-muted-foreground mt-2">Overall Interview Score</p>
          <Progress
            value={totalScore}
            className="mt-4 w-full max-w-xs h-2.5"
            indicatorClassName={
              totalScore >= 70 ? "bg-emerald-500" : totalScore >= 40 ? "bg-amber-500" : "bg-red-500"
            }
          />
          <Badge
            className="mt-4 text-sm px-3 py-1"
            variant={totalScore >= 70 ? "default" : totalScore >= 40 ? "secondary" : "destructive"}
          >
            {totalScore >= 80
              ? "Excellent!"
              : totalScore >= 60
                ? "Good"
                : "Needs Improvement"}
          </Badge>
          <div className="mt-6 flex items-center gap-6 text-sm">
            <div className="text-center">
              <p className="text-muted-foreground text-xs">Average</p>
              <p className="text-xl font-bold">{avgScore}/10</p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground text-xs">Questions</p>
              <p className="text-xl font-bold">{questions.length}</p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground text-xs">Strengths</p>
              <p className="text-xl font-bold text-emerald-500">{strengths.length}</p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground text-xs">Weaknesses</p>
              <p className="text-xl font-bold text-red-500">{weaknesses.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {strengths.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {strengths.map((q, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  <span className="line-clamp-1">{q.question}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {weaknesses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingDown className="h-4 w-4 text-red-500" />
              Areas to Improve
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {weaknesses.map((q, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                  <XCircle className="h-3.5 w-3.5 shrink-0" />
                  <span className="line-clamp-1">{q.question}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {questions.map((item, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-xs font-medium">
                      Q{i + 1}
                    </span>
                    <p className="text-sm font-medium">{item.question}</p>
                  </div>
                  <p className="text-muted-foreground mt-1 text-xs line-clamp-2 leading-relaxed">
                    {item.answer}
                  </p>
                  <div className="mt-2 flex items-start gap-2 rounded-lg bg-muted p-3">
                    {item.score >= 7 ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    ) : (
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                    )}
                    <p className="text-xs leading-relaxed">{item.feedback}</p>
                  </div>
                </div>
                <Badge
                  variant={item.score >= 7 ? "default" : item.score >= 4 ? "secondary" : "destructive"}
                  className="ml-4 shrink-0"
                >
                  {item.score}/10
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack}>
          Back to Selection
        </Button>
        <Button onClick={onRestart}>Try Again</Button>
      </div>
    </div>
  )
}
