import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { checkRateLimit, getRateLimitHeaders } from "@/lib/utils/rate-limit"

export async function POST() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id || "anonymous"

    const rl = checkRateLimit(`logout:${userId}`, { maxRequests: 10, windowMs: 60000 })
    const rlHeaders = getRateLimitHeaders(rl.remaining, rl.resetAt, 10)

    await supabase.auth.signOut()

    return NextResponse.json(
      { data: { message: "Logged out successfully" } },
      { status: 200, headers: rlHeaders }
    )
  } catch {
    return NextResponse.json(
      { data: { message: "Logged out successfully" } },
      { status: 200 }
    )
  }
}
