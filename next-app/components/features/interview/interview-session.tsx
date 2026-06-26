"use client"

import { useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Send, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface InterviewSessionProps {
  question: { question: string }
  questionNumber: number
  totalQuestions: number
  answer: string
  isSubmitting: boolean
  onAnswerChange: (value: string) => void
  onSubmit: () => void
  feedback?: { score: number; feedback: string; suggested_answer?: string } | null
  onNext: () => void
}

export function InterviewSession({
  question,
  questionNumber,
  totalQuestions,
  answer,
  isSubmitting,
  onAnswerChange,
  onSubmit,
  feedback,
  onNext,
}: InterviewSessionProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    textareaRef.current?.focus()
  }, [questionNumber])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        if (!isSubmitting && answer.trim()) {
          if (feedback) {
            onNext()
          } else {
            onSubmit()
          }
        }
      }
    },
    [isSubmitting, answer, feedback, onSubmit, onNext]
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="text-sm">
          Question {questionNumber} of {totalQuestions}
        </Badge>
      </div>

      <Progress value={(questionNumber / totalQuestions) * 100} className="h-1.5" />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg leading-relaxed">{question.question}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!feedback ? (
            <>
              <Textarea
                ref={textareaRef}
                placeholder="Type your answer here... Press Enter to submit, Shift+Enter for new line"
                className="min-h-[160px] resize-y text-sm leading-relaxed"
                value={answer}
                onChange={(e) => onAnswerChange(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <div className="flex items-center justify-between">
                <div />
                <Button
                  onClick={onSubmit}
                  disabled={isSubmitting || !answer.trim()}
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Submit Answer
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Your answer
                </p>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{answer}</p>
              </div>
              <div className="flex items-center gap-3 rounded-lg border p-4">
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold",
                    feedback.score >= 7
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                      : feedback.score >= 4
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                        : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                  )}
                >
                  {feedback.score}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Score: {feedback.score}/10</p>
                  <p className="text-muted-foreground text-sm">{feedback.feedback}</p>
                </div>
              </div>
              {(feedback as { suggested_answer?: string }).suggested_answer && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/50">
                  <p className="mb-1 text-xs font-medium text-emerald-700 uppercase tracking-wider dark:text-emerald-300">
                    Suggested answer
                  </p>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap text-emerald-900 dark:text-emerald-100">
                    {(feedback as { suggested_answer?: string }).suggested_answer}
                  </p>
                </div>
              )}
              <div className="flex justify-end">
                <Button onClick={onNext}>
                  {questionNumber < totalQuestions ? "Next Question" : "See Results"}
                  <Send className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
