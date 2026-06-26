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
  const [interviewType, setInterviewType] = useState<"technical" | "hr">("technical")
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [interviewId, setInterviewId] = useState<string | null>(null)
  const [questions, setQuestions] = useState<string[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [answers, setAnswers] = useState<QuestionResult[]>([])
  const [currentAnswer, setCurrentAnswer] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ score: number; feedback: string; suggested_answer?: string } | null>(null)
  const [totalScore, setTotalScore] = useState(0)
  const [loadingStage, setLoadingStage] = useState(1)
  const answersRef = useRef(answers)

  answersRef.current = answers

  useEffect(() => {
    if (phase !== "loading") return
    if (loadingStage >= 3) return
    const t = setTimeout(() => setLoadingStage((s) => s + 1), 800)
    return () => clearTimeout(t)
  }, [phase, loadingStage])

  const handleStart = useCallback(async (type: "technical" | "hr") => {
    setPhase("loading")
    setLoadingStage(1)
    setInterviewType(type)
    setInterviewId(null)
    setAnswers([])
    setTotalScore(0)

    try {
      const res = await fetch("/api/interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, question_count: 5, timer_seconds: 0 }),
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
    } catch {
      setPhase("error")
      setErrorMessage("Failed to start interview. Please try again.")
    }
  }, [])

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return
    const answer = currentAnswer.trim() || "No answer provided."
    if (!answer) return
    setIsSubmitting(true)

    try {
      if (!interviewId) throw new Error("No active interview")

      const res = await fetch(`/api/interview/${interviewId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer, question_index: currentIndex }),
      })

      if (!res.ok) {
        const errBody = await res.text()
        throw new Error(`API ${res.status}: ${errBody}`)
      }

      const json = await res.json()
      const result = json.data

      setFeedback({ score: result.score, feedback: result.feedback, suggested_answer: result.suggested_answer })
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
    } catch (e) {
      setPhase("error")
      setErrorMessage(e instanceof Error ? e.message : "Failed to submit answer")
      setIsSubmitting(false)
    }
  }, [currentAnswer, isSubmitting, currentIndex, questions, interviewId])

  const handleNext = useCallback(() => {
    const isLast = currentIndex >= totalQuestions - 1 || currentIndex >= questions.length - 1
    if (!isLast) {
      setCurrentIndex((prev) => prev + 1)
      setCurrentAnswer("")
      setFeedback(null)
    } else {
      const currentAnswers = answersRef.current
      const allScores = currentAnswers.map((a) => a.score)
      const total = Math.round(
        (allScores.reduce((sum, s) => sum + s, 0) / (Math.max(allScores.length, 1) * 10)) * 100
      )
      setTotalScore(total)
      setPhase("completed")
    }
  }, [currentIndex, totalQuestions, questions.length])

  const handleRestart = useCallback(() => {
    setPhase("select")
    setInterviewId(null)
    setQuestions([])
    setCurrentIndex(0)
    setAnswers([])
    setCurrentAnswer("")
    setFeedback(null)
    setTotalScore(0)
  }, [])

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
          phase={interviewType === "hr" ? "Preparing HR interview" : "Starting your interview"}
          stages={["Generating questions", "Setting up environment", "Ready to begin"]}
          currentStage={loadingStage}
        />
      )}

      {phase === "in-progress" && questions.length > 0 && (
        <InterviewSession
          question={{ question: questions[currentIndex] ?? "Question unavailable." }}
          questionNumber={currentIndex + 1}
          totalQuestions={totalQuestions}
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
