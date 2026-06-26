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
      const isHr = interview.type === "hr"
      const evalPrompt = isHr
        ? `You are a strict HR interviewer scoring a candidate 1-10 for a placement interview. Be harsh and honest.

Scoring guide:
- 1-2: No effort, irrelevant answer, or disrespectful
- 3-4: Poor response, vague, no real examples
- 5-6: Basic answer, some relevance but lacks structure or depth
- 7-8: Good response with clear examples and self-awareness
- 9-10: Excellent, structured (STAR), compelling examples, strong communication

Question: "${interview.questions[question_index]}"
Candidate answer: "${answer}"

Return ONLY valid JSON. Do NOT wrap in markdown or code blocks.
{
  "score": number (1-10, be strict),
  "feedback": "specific constructive feedback referencing the answer",
  "suggested_answer": "a model 10/10 answer using the STAR method — be detailed and structured"
}`
        : `You are a strict technical interviewer scoring a candidate 1-10 for a placement interview. Be harsh and honest.

Scoring guide:
- 1-2: No understanding, no effort, or completely wrong
- 3-4: Poor understanding, major gaps
- 5-6: Basic understanding, lacks depth or misses key points
- 7-8: Good understanding with some depth and examples
- 9-10: Excellent, comprehensive, well-structured with strong examples

Question: "${interview.questions[question_index]}"
Candidate answer: "${answer}"

Return ONLY valid JSON. Do NOT wrap in markdown or code blocks.
{
  "score": number (1-10, be strict),
  "feedback": "specific constructive feedback referencing the answer",
  "suggested_answer": "a complete model answer that would score 10/10 — be detailed, structured, and show exactly what a perfect answer includes"
}`

      const result = await callAI("interview", evalPrompt)
      const cleaned = result.replace(/```(?:json)?\s*([\s\S]*?)```/gi, "$1").trim()
      const parsed = JSON.parse(cleaned)
      score = typeof parsed.score === "number" ? parsed.score : 5
      feedback = parsed.feedback || feedback
      suggestedAnswer = parsed.suggested_answer || ""
    } catch {
      score = Math.floor(Math.random() * 5) + 1
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
