"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

interface StartInterviewResponse {
  id: string
  type: string
  status: string
  current_question: number
  questions: string[]
  total_questions: number
  timer_seconds: number
  started_at: string
}

async function startInterview(data: {
  type: "technical" | "hr"
  question_count?: number
  timer_seconds?: number
}): Promise<StartInterviewResponse> {
  const res = await fetch("/api/interview/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.error ?? "Failed to start interview")
  }
  const json = await res.json()
  return json.data as StartInterviewResponse
}

interface SubmitAnswerResponse {
  question_index: number
  score: number
  feedback: string
  suggested_answer: string
  is_last: boolean
  next_question: string | null
  total_score: number | null
}

async function submitAnswer(
  interviewId: string,
  data: { answer: string; question_index: number }
): Promise<SubmitAnswerResponse> {
  const res = await fetch(`/api/interview/${interviewId}/answer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.error ?? "Failed to submit answer")
  }
  const json = await res.json()
  return json.data as SubmitAnswerResponse
}

export function useStartInterview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: startInterview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    },
  })
}

export function useSubmitAnswer() {
  return useMutation({
    mutationFn: ({
      interviewId,
      data,
    }: {
      interviewId: string
      data: { answer: string; question_index: number }
    }) => submitAnswer(interviewId, data),
  })
}
