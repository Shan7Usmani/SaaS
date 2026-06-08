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

    const rl = checkRateLimit(`resume_get:${user.id}`, { maxRequests: 60, windowMs: 60000 })
    const rlHeaders = getRateLimitHeaders(rl.remaining, rl.resetAt, 60)

    const { data: resume, error } = await supabase
      .from("resumes")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (error || !resume) throw notFound("Resume")

    if (resume.status === "analyzing") {
      return NextResponse.json(
        { error: "Analysis in progress", code: "ANALYZING" },
        { status: 425, headers: rlHeaders }
      )
    }

    let pdf_url = resume.pdf_url
    if (resume.pdf_storage_path) {
      const { data: signedUrl } = await supabase.storage
        .from("resumes")
        .createSignedUrl(resume.pdf_storage_path, 3600)
      if (signedUrl?.signedUrl) {
        pdf_url = signedUrl.signedUrl
      }
    }

    return NextResponse.json(
      { data: { ...resume, pdf_url } },
      { status: 200, headers: rlHeaders }
    )
  } catch (err) {
    return handleApiError(err)
  }
}
