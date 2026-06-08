import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { z } from "zod"
import { handleApiError, unauthorized, notFound } from "@/lib/utils/errors"
import { checkRateLimit, getRateLimitHeaders } from "@/lib/utils/rate-limit"

const topicSchema = z.object({
  is_completed: z.boolean(),
})

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; topicId: string }> }
) {
  try {
    const { id, topicId } = await params
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw unauthorized()

    const rl = checkRateLimit(`roadmap_topic:${user.id}`, { maxRequests: 120, windowMs: 60000 })
    const rlHeaders = getRateLimitHeaders(rl.remaining, rl.resetAt, 120)

    const body = await request.json()
    const { is_completed } = topicSchema.parse(body)

    const { data: roadmap } = await supabase
      .from("roadmaps")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (!roadmap) throw notFound("Roadmap")

    const updateData: Record<string, unknown> = { is_completed }
    if (is_completed) {
      updateData.completed_at = new Date().toISOString()
    } else {
      updateData.completed_at = null
    }

    const { data: topic, error } = await supabase
      .from("roadmap_topics")
      .update(updateData)
      .eq("id", topicId)
      .eq("roadmap_id", id)
      .select()
      .single()

    if (error || !topic) throw notFound("Topic")

    const { count: total } = await supabase
      .from("roadmap_topics")
      .select("*", { count: "exact", head: true })
      .eq("roadmap_id", id)

    const { count: completed } = await supabase
      .from("roadmap_topics")
      .select("*", { count: "exact", head: true })
      .eq("roadmap_id", id)
      .eq("is_completed", true)

    const completionPct = total ? Math.round(((completed ?? 0) / total) * 100) : 0

    await supabase
      .from("roadmaps")
      .update({ completion_pct: completionPct })
      .eq("id", id)

    return NextResponse.json(
      {
        data: {
          ...topic,
          roadmap_completion_pct: completionPct,
        },
      },
      { status: 200, headers: rlHeaders }
    )
  } catch (err) {
    return handleApiError(err)
  }
}
