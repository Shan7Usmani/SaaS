import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { z } from "zod"
import { handleApiError, unauthorized } from "@/lib/utils/errors"
import { checkRateLimit, getRateLimitHeaders } from "@/lib/utils/rate-limit"
import { checkAILimit } from "@/lib/ai/rate-limiter"
import { callAI } from "@/lib/ai/router"
import { buildRoadmapPrompt, preBuiltRoadmaps } from "@/lib/ai/prompts/roadmap"

const generateSchema = z.object({
  target_company: z.string().min(1).max(100),
  target_role: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw unauthorized()

    const rl = checkRateLimit(`roadmap_gen:${user.id}`, { maxRequests: 10, windowMs: 60000 })
    const rlHeaders = getRateLimitHeaders(rl.remaining, rl.resetAt, 10)

    const body = await request.json()
    const { target_company, target_role } = generateSchema.parse(body)

    await checkAILimit(user.id, "roadmap_generate")

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    let months: { month: number; title: string; topics: { name: string }[] }[]

    try {
      const prompt = buildRoadmapPrompt(profile || { target_companies: [] }, target_company)
      const result = await callAI("roadmap", prompt)
      const parsed = JSON.parse(result)
      months = parsed.months
    } catch (aiError) {
      console.warn("AI roadmap generation failed, using template:", aiError)
      const template = preBuiltRoadmaps[target_company] || preBuiltRoadmaps["Amazon SDE-1"]
      months = template.months
    }

    const topicCount = months.reduce((sum, m) => sum + m.topics.length, 0)

    const { data: roadmap, error } = await supabase
      .from("roadmaps")
      .insert({
        user_id: user.id,
        target_company,
        target_role: target_role || null,
        generated_via: "ai",
        months,
        completion_pct: 0,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: "Failed to save roadmap", code: "DB_ERROR" },
        { status: 500, headers: rlHeaders }
      )
    }

    const topics = months.flatMap((m) =>
      m.topics.map((t) => ({
        roadmap_id: roadmap.id,
        month_number: m.month,
        topic_name: t.name,
        sort_order: m.topics.indexOf(t),
      }))
    )

    await supabase.from("roadmap_topics").insert(topics)

    await supabase
      .from("roadmaps")
      .update({
        regeneration_count: 1,
        last_regenerated_at: new Date().toISOString(),
      })
      .eq("id", roadmap.id)

    return NextResponse.json(
      {
        data: {
          ...roadmap,
          total_topics: topicCount,
        },
      },
      { status: 201, headers: rlHeaders }
    )
  } catch (err) {
    return handleApiError(err)
  }
}
