import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { z } from "zod"
import { handleApiError } from "@/lib/utils/errors"
import { checkRateLimit, getRateLimitHeaders } from "@/lib/utils/rate-limit"

const googleSchema = z.object({
  id_token: z.string().min(1, "ID token is required"),
})

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "anonymous"
    const rl = checkRateLimit(`google_auth:${ip}`, { maxRequests: 10, windowMs: 60000 })
    const rlHeaders = getRateLimitHeaders(rl.remaining, rl.resetAt, 10)

    const body = await request.json()
    const { id_token } = googleSchema.parse(body)

    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: "google",
      token: id_token,
    })

    if (error) {
      return NextResponse.json(
        { error: "Google authentication failed", code: "AUTH_ERROR" },
        { status: 401, headers: rlHeaders }
      )
    }

    return NextResponse.json(
      {
        data: {
          user: { id: data.user?.id, email: data.user?.email },
          session: data.session,
        },
      },
      { status: 200, headers: rlHeaders }
    )
  } catch (err) {
    return handleApiError(err)
  }
}
