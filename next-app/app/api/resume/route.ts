import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { handleApiError, unauthorized } from "@/lib/utils/errors"
import { checkRateLimit, getRateLimitHeaders } from "@/lib/utils/rate-limit"

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw unauthorized()

    const rl = checkRateLimit(`resumes_list:${user.id}`, { maxRequests: 30, windowMs: 60000 })
    const rlHeaders = getRateLimitHeaders(rl.remaining, rl.resetAt, 30)

    const { data, count, error } = await supabase
      .from("resumes")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch resumes", code: "DB_ERROR" },
        { status: 500, headers: rlHeaders }
      )
    }

    return NextResponse.json(
      { data: data || [], total: count || 0 },
      { status: 200, headers: rlHeaders }
    )
  } catch (err) {
    return handleApiError(err)
  }
}
