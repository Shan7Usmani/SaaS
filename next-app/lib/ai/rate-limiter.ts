import { createAdminClient } from "@/lib/supabase/admin"
import { AppError } from "@/lib/utils/errors"

const DAILY_LIMITS: Record<string, number> = {
  roadmap_generate: 3,
  resume_analyze: 2,
  interview_start: 3,
  interview_answer: 20,
  ai_chat: 20,
}

export async function checkAILimit(userId: string, feature: string) {
  const limit = DAILY_LIMITS[feature]
  if (!limit) return

  const supabase = createAdminClient()
  const now = new Date()
  const resetAt = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)

  const { data } = await supabase
    .from("usage_tracking")
    .select("count")
    .eq("user_id", userId)
    .eq("feature", feature)
    .gte("reset_at", now.toISOString())
    .maybeSingle()

  const currentCount = data?.count ?? 0

  if (currentCount >= limit) {
    throw new AppError(
      `Daily limit reached for ${feature}. Limit: ${limit}/day. Resets at midnight.`,
      "RATE_LIMITED",
      429
    )
  }

  // Upsert counter
  await supabase.from("usage_tracking").upsert(
    {
      user_id: userId,
      feature,
      count: currentCount + 1,
      reset_at: resetAt.toISOString(),
    },
    { onConflict: "user_id, feature, reset_at" }
  )
}
