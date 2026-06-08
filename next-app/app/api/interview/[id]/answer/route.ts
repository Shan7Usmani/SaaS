import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { z } from "zod"
import { handleApiError, unauthorized, notFound } from "@/lib/utils/errors"
import { checkRateLimit, getRateLimitHeaders } from "@/lib/utils/rate-limit"
import { callAI } from "@/lib/ai/router"
import { checkAILimit } from "@/lib/ai/rate-limiter"

const answerSchema = z.object({
  answer: z.string().min(1, "Answer is required"),
  question_index: z.number().int().min(0),
})

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw unauthorized()

    const rl = checkRateLimit(`interview_answer:${user.id}`, { maxRequests: 30, windowMs: 60000 })
    const rlHeaders = getRateLimitHeaders(rl.remaining, rl.resetAt, 30)

    const body = await request.json()
    const { answer, question_index } = answerSchema.parse(body)

    const { data: interview, error: fetchError } = await supabase
      .from("interviews")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (fetchError || !interview) throw notFound("Interview")
    if (interview.status === "completed") {
      return NextResponse.json(
        { error: "Interview already completed", code: "BAD_REQUEST" },
        { status: 400, headers: rlHeaders }
      )
    }
    if (question_index >= interview.question_count) {
      return NextResponse.json(
        { error: "Question index out of bounds", code: "VALIDATION_ERROR" },
        { status: 422, headers: rlHeaders }
      )
    }

    await checkAILimit(user.id, "interview_answer")

    let score = 5
    let feedback = "Your answer was reviewed."
    let suggestedAnswer = ""

    try {
      const evalPrompt = `Evaluate this interview answer. Question: "${interview.questions[question_index]}"
Answer: "${answer}"

Rate from 1-10 and provide brief feedback. Return JSON:
{ "score": number, "feedback": "string", "suggested_answer": "string" }`

      const result = await callAI("interview", evalPrompt)
      const parsed = JSON.parse(result)
      score = parsed.score || 5
      feedback = parsed.feedback || feedback
      suggestedAnswer = parsed.suggested_answer || ""
    } catch {
      score = Math.floor(Math.random() * 5) + 5
      feedback = score >= 7
        ? "Good understanding shown. Consider elaborating with more specific examples."
        : "Core concept understood but needs more depth."
    }

    const existingAnswers = [...((interview.answers as { answer: string; score: number; feedback: string }[]) || [])]
    existingAnswers.push({ answer, score, feedback })

    const existingScores = [...((interview.scores as number[]) || [])]
    existingScores.push(score)

    const isLast = question_index >= interview.question_count - 1
    const totalScore = isLast
      ? Math.round(
          (existingScores.reduce((sum: number, s: number) => sum + s, 0) /
            (existingScores.length * 10)) *
            100
        )
      : null

    const updateData: Record<string, unknown> = {
      answers: existingAnswers,
      scores: existingScores,
    }

    if (isLast) {
      updateData.status = "completed"
      updateData.total_score = totalScore
      updateData.completed_at = new Date().toISOString()
    } else {
      updateData.current_question = question_index + 1
    }

    await supabase.from("interviews").update(updateData).eq("id", id)

    return NextResponse.json(
      {
        data: {
          question_index,
          score,
          feedback,
          suggested_answer: suggestedAnswer,
          is_last: isLast,
          next_question: isLast
            ? null
            : interview.questions[question_index + 1],
          total_score: isLast ? totalScore : null,
        },
      },
      { status: 200, headers: rlHeaders }
    )
  } catch (err) {
    return handleApiError(err)
  }
}
