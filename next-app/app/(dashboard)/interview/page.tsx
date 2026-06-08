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

const FALLBACK_QUESTIONS = [
  "Explain the difference between a stack and a queue. Give real-world examples of each.",
  "What is time complexity? Explain Big O notation with examples of O(1), O(n), and O(n²).",
  "How does a hashmap work internally? Explain collision resolution techniques.",
  "What is the difference between inner join, left join, and right join in SQL?",
  "Explain the concept of recursion. When would you use it over iteration?",
  "What is the difference between a process and a thread?",
  "Explain how TCP three-way handshake works.",
  "What is the difference between REST and GraphQL?",
  "Explain the SOLID principles of object-oriented design.",
  "What is indexing in databases and how does it improve query performance?",
]

export default function InterviewPage() {
  const [phase, setPhase] = useState<Phase>("select")
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
      const firstQuestion = data.questions?.[0] ?? FALLBACK_QUESTIONS[0]
      setQuestions([firstQuestion])
      setTotalQuestions(data.total_questions ?? 5)
      setCurrentIndex(0)
      setCurrentAnswer("")
      setFeedback(null)
      setPhase("in-progress")
      startTimer()
    } catch {
      setInterviewId(null)
      setQuestions(FALLBACK_QUESTIONS.slice(0, 5))
      setTotalQuestions(5)
      setCurrentIndex(0)
      setCurrentAnswer("")
      setFeedback(null)
      setPhase("in-progress")
      startTimer()
    }
  }, [startTimer])

  const handleSubmit = useCallback(async () => {
    if (!currentAnswer.trim() || isSubmitting) return
    setIsSubmitting(true)
    clearTimer()

    try {
      if (interviewId) {
        const res = await fetch(`/api/interview/${interviewId}/answer`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answer: currentAnswer, question_index: currentIndex }),
        })

        if (res.ok) {
          const json = await res.json()
          const result = json.data

          const score = result.score ?? 5
          const fb = result.feedback ?? "Answer reviewed."

          setFeedback({ score, feedback: fb })
          setAnswers((prev) => [
            ...prev,
            {
              question: questions[currentIndex],
              answer: currentAnswer,
              score,
              feedback: fb,
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
        }
      }
    } catch {
      // Fallback to client-side scoring below
    }

    const length = currentAnswer.length
    const hasExamples =
      currentAnswer.toLowerCase().includes("example") ||
      currentAnswer.toLowerCase().includes("like") ||
      currentAnswer.toLowerCase().includes("for instance")
    const isDetailed = currentAnswer.split(" ").length > 20

    let score = 5
    if (isDetailed && hasExamples) score = 8
    else if (isDetailed) score = 6
    else if (hasExamples) score = 7
    else score = 4 + Math.floor(Math.random() * 3)

    let feedbackText = ""
    if (score >= 8) {
      feedbackText = "Excellent answer! You demonstrated clear understanding and provided relevant examples."
    } else if (score >= 6) {
      feedbackText = "Good understanding shown. To improve, add more specific examples."
    } else if (score >= 4) {
      feedbackText = "Core concept understood but lacks depth."
    } else {
      feedbackText = "Needs significant improvement."
    }

    setFeedback({ score, feedback: feedbackText })
    setAnswers((prev) => [
      ...prev,
      { question: questions[currentIndex], answer: currentAnswer, score, feedback: feedbackText },
    ])
    setIsSubmitting(false)
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
      const lastScore = allScores[allScores.length - 1] ?? 0
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
          message="Something went wrong. Please try again."
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
