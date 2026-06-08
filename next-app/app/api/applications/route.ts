import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { z } from "zod"
import { handleApiError, unauthorized } from "@/lib/utils/errors"
import { checkRateLimit, getRateLimitHeaders } from "@/lib/utils/rate-limit"

const createSchema = z.object({
  company: z.string().min(1, "Company is required").max(200),
  role: z.string().min(1, "Role is required").max(200),
  stage: z.enum(["applied", "oa", "interview", "offer", "rejected"]).default("applied"),
  notes: z.string().max(2000).optional(),
  applied_at: z.string().optional(),
})

export async function GET(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw unauthorized()

    const rl = checkRateLimit(`apps_list:${user.id}`, { maxRequests: 60, windowMs: 60000 })
    const rlHeaders = getRateLimitHeaders(rl.remaining, rl.resetAt, 60)

    const { searchParams } = new URL(request.url)
    const stage = searchParams.get("stage")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100)
    const offset = (page - 1) * limit

    let query = supabase
      .from("applications")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)

    if (stage) {
      query = query.eq("stage", stage)
    }

    const { data, count, error } = await query
      .order("applied_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch applications", code: "DB_ERROR" },
        { status: 500, headers: rlHeaders }
      )
    }

    return NextResponse.json(
      { data: data || [], total: count || 0, page, limit },
      { status: 200, headers: rlHeaders }
    )
  } catch (err) {
    return handleApiError(err)
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw unauthorized()

    const rl = checkRateLimit(`apps_create:${user.id}`, { maxRequests: 20, windowMs: 60000 })
    const rlHeaders = getRateLimitHeaders(rl.remaining, rl.resetAt, 20)

    const body = await request.json()
    const { company, role, stage, notes, applied_at } = createSchema.parse(body)

    const { data, error } = await supabase
      .from("applications")
      .insert({
        user_id: user.id,
        company,
        role,
        stage,
        notes: notes || null,
        applied_at: applied_at ? new Date(applied_at).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: "Failed to create application", code: "DB_ERROR" },
        { status: 500, headers: rlHeaders }
      )
    }

    return NextResponse.json({ data }, { status: 201, headers: rlHeaders })
  } catch (err) {
    return handleApiError(err)
  }
}
