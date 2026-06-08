import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { z } from "zod"
import { handleApiError } from "@/lib/utils/errors"
import { checkRateLimit, getRateLimitHeaders } from "@/lib/utils/rate-limit"

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "anonymous"
    const rl = checkRateLimit(`login:${ip}`, { maxRequests: 10, windowMs: 60000 })
    const rlHeaders = getRateLimitHeaders(rl.remaining, rl.resetAt, 10)

    const body = await request.json()
    const { email, password } = loginSchema.parse(body)

    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json(
        { error: "Invalid email or password", code: "INVALID_CREDENTIALS" },
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
