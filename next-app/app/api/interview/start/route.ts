import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { z } from "zod"
import { handleApiError, unauthorized } from "@/lib/utils/errors"
import { checkRateLimit, getRateLimitHeaders } from "@/lib/utils/rate-limit"

const startSchema = z.object({
  type: z.enum(["technical", "hr"]).default("technical"),
  question_count: z.number().int().min(3).max(10).default(5),
  timer_seconds: z.number().int().default(60),
})

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const TECHNICAL_QUESTIONS = shuffle([
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
  "What is the difference between let, const, and var in JavaScript?",
  "Explain how promises work in JavaScript.",
  "What is the virtual DOM in React?",
  "Describe the difference between SQL and NoSQL databases.",
  "What is deadlock in operating systems? How can you prevent it?",
])

const HR_QUESTIONS = shuffle([
  "Tell me about yourself and your background.",
  "What are your greatest strengths and weaknesses?",
  "Where do you see yourself in five years?",
  "Why do you want to work at our company?",
  "Describe a time you faced a challenge and how you overcame it.",
  "Tell me about a time you worked in a team to achieve a goal.",
  "How do you handle pressure or stressful situations?",
  "Describe a situation where you showed leadership.",
  "What makes you a good fit for this role?",
  "Tell me about a time you failed and what you learned from it.",
  "How do you prioritize your tasks when working on multiple projects?",
  "Describe a time you had a conflict with a teammate and how you resolved it.",
  "What skills do you want to develop in the next year?",
  "Why should we hire you over other candidates?",
  "Tell me about a project you're proud of and your role in it.",
])

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw unauthorized()

    const rl = checkRateLimit(`interview_start:${user.id}`, { maxRequests: 20, windowMs: 60000 })
    const rlHeaders = getRateLimitHeaders(rl.remaining, rl.resetAt, 20)

    const body = await request.json()
    const { type, question_count, timer_seconds } = startSchema.parse(body)

    const questions = (type === "hr" ? HR_QUESTIONS : TECHNICAL_QUESTIONS).slice(0, question_count)

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
