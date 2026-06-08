import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { z } from "zod"
import { handleApiError } from "@/lib/utils/errors"
import { checkRateLimit, getRateLimitHeaders } from "@/lib/utils/rate-limit"

const resetSchema = z.object({
  email: z.string().email("Invalid email address"),
})

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "anonymous"
    const rl = checkRateLimit(`reset_pw:${ip}`, { maxRequests: 3, windowMs: 60000 })
    const rlHeaders = getRateLimitHeaders(rl.remaining, rl.resetAt, 3)

    const body = await request.json()
    const { email } = resetSchema.parse(body)

    const supabase = await createServerSupabaseClient()

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${new URL(request.url).origin}/auth/callback?next=/reset-password`,
    })

    if (error) {
      return NextResponse.json(
        { error: error.message, code: "AUTH_ERROR" },
        { status: 400, headers: rlHeaders }
      )
    }

    return NextResponse.json(
      { data: { message: "Password reset email sent" } },
      { status: 200, headers: rlHeaders }
    )
  } catch (err) {
    return handleApiError(err)
  }
}
