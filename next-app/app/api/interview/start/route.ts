import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { z } from "zod"
import { handleApiError, unauthorized } from "@/lib/utils/errors"
import { checkRateLimit, getRateLimitHeaders } from "@/lib/utils/rate-limit"
import { checkAILimit } from "@/lib/ai/rate-limiter"
import { callAI } from "@/lib/ai/router"

const startSchema = z.object({
  type: z.enum(["technical", "hr"]).default("technical"),
  question_count: z.number().int().min(3).max(10).default(5),
  timer_seconds: z.number().int().min(30).max(300).default(60),
})

const TECHNICAL_QUESTIONS = [
  "Explain the difference between a stack and a queue. Give real-world examples of each.",
  "What is time complexity? Explain Big O notation with examples of O(1), O(n), and O(n²).",
  "How does a hashmap work internally? Explain collision resolution techniques.",
  "What is the difference between inner join, left join, and right join in SQL?",
  "Explain the concept of recursion. When would you use it over iteration?",
  "What is the difference between a process and a thread?",
  "Explain how TCP handshake works.",
  "What is the difference between REST and GraphQL?",
  "Explain the SOLID principles of object-oriented design.",
  "What is indexing in databases and how does it improve query performance?",
]

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw unauthorized()

    const rl = checkRateLimit(`interview_start:${user.id}`, { maxRequests: 20, windowMs: 60000 })
    const rlHeaders = getRateLimitHeaders(rl.remaining, rl.resetAt, 20)

    const body = await request.json()
    const { type, question_count, timer_seconds } = startSchema.parse(body)

    await checkAILimit(user.id, "interview_start")

    let questions: string[]

    try {
      const prompt = `Generate ${question_count} ${type} interview questions for a college student preparing for placements. Return ONLY a JSON array of strings.`
      const result = await callAI("interview", prompt)
      const parsed = JSON.parse(result)
      questions = Array.isArray(parsed) ? parsed.slice(0, question_count) : TECHNICAL_QUESTIONS.slice(0, question_count)
    } catch {
      questions = TECHNICAL_QUESTIONS.slice(0, question_count)
    }

    const { data: interview, error } = await supabase
      .from("interviews")
      .insert({
        user_id: user.id,
        type,
        question_count,
        timer_per_question: timer_seconds,
        questions,
        status: "in_progress",
        current_question: 0,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: "Failed to create interview", code: "DB_ERROR" },
        { status: 500, headers: rlHeaders }
      )
    }

    return NextResponse.json(
      {
        data: {
          id: interview.id,
          type: interview.type,
          status: interview.status,
          current_question: 1,
          questions: [interview.questions[0]],
          total_questions: interview.question_count,
          timer_seconds: interview.timer_per_question,
          started_at: interview.started_at,
        },
      },
      { status: 201, headers: rlHeaders }
    )
  } catch (err) {
    return handleApiError(err)
  }
}
