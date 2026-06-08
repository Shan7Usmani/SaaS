import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { handleApiError, unauthorized, notFound } from "@/lib/utils/errors"
import { checkRateLimit, getRateLimitHeaders } from "@/lib/utils/rate-limit"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw unauthorized()

    const rl = checkRateLimit(`interview_get:${user.id}`, { maxRequests: 60, windowMs: 60000 })
    const rlHeaders = getRateLimitHeaders(rl.remaining, rl.resetAt, 60)

    const { data: interview, error } = await supabase
      .from("interviews")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (error || !interview) throw notFound("Interview")

    return NextResponse.json({ data: interview }, { status: 200, headers: rlHeaders })
  } catch (err) {
    return handleApiError(err)
  }
}
