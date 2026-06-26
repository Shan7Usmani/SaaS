import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { z } from "zod"
import { handleApiError, unauthorized, notFound } from "@/lib/utils/errors"
import { checkRateLimit, getRateLimitHeaders } from "@/lib/utils/rate-limit"

const updateSchema = z.object({
  company: z.string().min(1).max(200).optional(),
  role: z.string().min(1).max(200).optional(),
  stage: z.enum(["applied", "oa_received", "interview", "offer", "rejected"]).optional(),
  notes: z.string().max(2000).optional().nullable(),
})

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw unauthorized()

    const rl = checkRateLimit(`apps_update:${user.id}`, { maxRequests: 30, windowMs: 60000 })
    const rlHeaders = getRateLimitHeaders(rl.remaining, rl.resetAt, 30)

    const body = await request.json()
    const updates = updateSchema.parse(body)

    const { data, error } = await supabase
      .from("applications")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error || !data) throw notFound("Application")

    return NextResponse.json({ data }, { status: 200, headers: rlHeaders })
  } catch (err) {
    return handleApiError(err)
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw unauthorized()

    const rl = checkRateLimit(`apps_delete:${user.id}`, { maxRequests: 20, windowMs: 60000 })
    const rlHeaders = getRateLimitHeaders(rl.remaining, rl.resetAt, 20)

    const { error } = await supabase
      .from("applications")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)

    if (error) throw notFound("Application")

    return NextResponse.json(
      { data: { message: "Deleted successfully" } },
      { status: 200, headers: rlHeaders }
    )
  } catch (err) {
    return handleApiError(err)
  }
}
