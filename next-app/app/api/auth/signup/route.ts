import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { z } from "zod"
import { handleApiError } from "@/lib/utils/errors"
import { checkRateLimit, getRateLimitHeaders } from "@/lib/utils/rate-limit"

const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
})

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "anonymous"
    const rl = checkRateLimit(`signup:${ip}`, { maxRequests: 5, windowMs: 60000 })
    const rlHeaders = getRateLimitHeaders(rl.remaining, rl.resetAt, 5)

    const body = await request.json()
    const { email, password, name } = signupSchema.parse(body)

    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })

    if (error) {
      if (error.message.includes("already")) {
        return NextResponse.json(
          { error: "An account with this email already exists", code: "CONFLICT" },
          { status: 409, headers: rlHeaders }
        )
      }
      return NextResponse.json(
        { error: error.message, code: "AUTH_ERROR" },
        { status: 400, headers: rlHeaders }
      )
    }

    return NextResponse.json(
      {
        data: {
          user: { id: data.user?.id, email: data.user?.email },
          session: data.session,
        },
      },
      { status: 201, headers: rlHeaders }
    )
  } catch (err) {
    return handleApiError(err)
  }
}
