"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { InterviewSetup } from "@/components/features/interview/interview-setup"
import { InterviewSession } from "@/components/features/interview/interview-session"
import { InterviewSummary } from "@/components/features/interview/interview-summary"
import { AiLoadingState, AiErrorState } from "@/components/features/ai/loading-states"

type Phase = "select" | "loading" | "in-progress" | "completed" | "error"

interface QuestionResult {
  question: string
  answer: string
  score: number
  feedback: string
}

export default function InterviewPage() {
  const [phase, setPhase] = useState<Phase>("select")
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [interviewId, setInterviewId] = useState<string | null>(null)
  const [questions, setQuestions] = useState<string[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [answers, setAnswers] = useState<QuestionResult[]>([])
  const [currentAnswer, setCurrentAnswer] = useState("")
  const [timeLeft, setTimeLeft] = useState(60)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ score: number; feedback: string } | null>(null)
  const [totalScore, setTotalScore] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const startTimer = useCallback(() => {
    clearTimer()
    setTimeLeft(60)
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearTimer()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [clearTimer])

  useEffect(() => {
    return () => clearTimer()
  }, [clearTimer])

  const handleStart = useCallback(async (type: "technical" | "hr") => {
    setPhase("loading")
    setInterviewId(null)
    setAnswers([])

    try {
      const res = await fetch("/api/interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, question_count: 5, timer_seconds: 60 }),
      })

      if (!res.ok) throw new Error("Failed to start interview")

      const json = await res.json()
      const data = json.data

      setInterviewId(data.id)
      const question = data.questions?.[0] ?? "Question unavailable."
      setQuestions([question])
      setTotalQuestions(data.total_questions ?? 5)
      setCurrentIndex(0)
      setCurrentAnswer("")
      setFeedback(null)
      setPhase("in-progress")
      startTimer()
    } catch {
      setPhase("error")
      setErrorMessage("Failed to start interview. Please try again.")
    }
  }, [startTimer])

  const handleSubmit = useCallback(async () => {
    if (!currentAnswer.trim() || isSubmitting) return
    setIsSubmitting(true)
    clearTimer()

    try {
      if (!interviewId) throw new Error("No active interview")

      const res = await fetch(`/api/interview/${interviewId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer: currentAnswer, question_index: currentIndex }),
      })

      if (!res.ok) throw new Error("Failed to submit answer")

      const json = await res.json()
      const result = json.data

      setFeedback({ score: result.score, feedback: result.feedback })
      setAnswers((prev) => [
        ...prev,
        {
          question: questions[currentIndex],
          answer: currentAnswer,
          score: result.score,
          feedback: result.feedback,
        },
      ])

      if (result.next_question) {
        setQuestions((prev) => [...prev, result.next_question])
      }

      if (result.is_last) {
        setTotalScore(result.total_score ?? 0)
      }

      setIsSubmitting(false)
      return
    } catch {
      setPhase("error")
      setErrorMessage("Failed to submit answer. Please restart the interview.")
      setIsSubmitting(false)
    }
  }, [currentAnswer, isSubmitting, clearTimer, currentIndex, questions, interviewId])

  const handleNext = useCallback(() => {
    const isLast = currentIndex >= totalQuestions - 1 || currentIndex >= questions.length - 1
    if (!isLast) {
      setCurrentIndex((prev) => prev + 1)
      setCurrentAnswer("")
      setFeedback(null)
      startTimer()
    } else {
      clearTimer()
      const allScores = answers.map((a) => a.score)
      const total = totalScore > 0
        ? totalScore
        : Math.round(
            (allScores.reduce((sum, s) => sum + s, 0) / (allScores.length * 10)) * 100
          )
      setTotalScore(total)
      setPhase("completed")
    }
  }, [currentIndex, totalQuestions, questions.length, answers, startTimer, clearTimer, totalScore])

  const handleRestart = useCallback(() => {
    setPhase("select")
    setInterviewId(null)
    setQuestions([])
    setCurrentIndex(0)
    setAnswers([])
    setCurrentAnswer("")
    setFeedback(null)
    setTotalScore(0)
    clearTimer()
  }, [clearTimer])

  if (phase === "error") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mock Interview</h1>
          <p className="text-muted-foreground mt-1">
            Practice with AI-powered technical interviews
          </p>
        </div>
        <AiErrorState
          message={errorMessage || "Something went wrong. Please try again."}
          onRetry={() => setPhase("select")}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mock Interview</h1>
        <p className="text-muted-foreground mt-1">
          Practice with AI-powered technical interviews
        </p>
      </div>

      {phase === "select" && <InterviewSetup onStart={handleStart} />}

      {phase === "loading" && (
        <AiLoadingState
          phase="Starting your interview"
          stages={["Generating questions", "Setting up environment", "Ready to begin"]}
          currentStage={1}
        />
      )}

      {phase === "in-progress" && questions.length > 0 && (
        <InterviewSession
          question={{ question: questions[currentIndex] ?? "Question unavailable." }}
          questionNumber={currentIndex + 1}
          totalQuestions={totalQuestions}
          timeLeft={timeLeft}
          answer={currentAnswer}
          isSubmitting={isSubmitting}
          onAnswerChange={setCurrentAnswer}
          onSubmit={handleSubmit}
          feedback={feedback}
          onNext={handleNext}
        />
      )}

      {phase === "completed" && (
        <InterviewSummary
          totalScore={totalScore}
          questions={answers}
          onRestart={handleRestart}
          onBack={() => setPhase("select")}
        />
      )}
    </div>
  )
}
