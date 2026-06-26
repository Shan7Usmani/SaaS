import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { z } from "zod"
import { handleApiError, unauthorized } from "@/lib/utils/errors"
import { checkRateLimit, getRateLimitHeaders } from "@/lib/utils/rate-limit"

const profileUpdateSchema = z.object({
  full_name: z.string().min(2).max(100).optional(),
  college: z.string().min(2).max(200).optional(),
  branch: z.string().min(2).max(100).optional(),
  current_year: z.number().int().min(1).max(5).optional(),
  cgpa: z.number().min(0).max(10).optional(),
  target_companies: z.array(z.string()).optional(),
  dsa_level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  preferred_role: z.enum(["swe", "data_analyst", "ai_engineer", "web_dev"]).optional(),
  onboarding_completed: z.boolean().optional(),
  auth_provider: z.string().optional(),
  auth_id: z.string().optional(),
})

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw unauthorized()

    const rl = checkRateLimit(`profile_get:${user.id}`, { maxRequests: 60, windowMs: 60000 })
    const rlHeaders = getRateLimitHeaders(rl.remaining, rl.resetAt, 60)

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: "Profile not found", code: "NOT_FOUND" },
        { status: 404, headers: rlHeaders }
      )
    }

    return NextResponse.json({ data }, { status: 200, headers: rlHeaders })
  } catch (err) {
    return handleApiError(err)
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw unauthorized()

    const rl = checkRateLimit(`profile_update:${user.id}`, { maxRequests: 30, windowMs: 60000 })
    const rlHeaders = getRateLimitHeaders(rl.remaining, rl.resetAt, 30)

    const body = await request.json()
    const updates = profileUpdateSchema.parse(body)

    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: "Failed to update profile", code: "UPDATE_ERROR" },
        { status: 500, headers: rlHeaders }
      )
    }

    return NextResponse.json({ data }, { status: 200, headers: rlHeaders })
  } catch (err) {
    return handleApiError(err)
  }
}
