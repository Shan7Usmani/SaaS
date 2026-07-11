import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { handleApiError, unauthorized } from "@/lib/utils/errors"
import { checkRateLimit, getRateLimitHeaders } from "@/lib/utils/rate-limit"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw unauthorized()

    const rl = checkRateLimit(`dashboard:${user.id}`, { maxRequests: 60, windowMs: 60000 })
    const rlHeaders = getRateLimitHeaders(rl.remaining, rl.resetAt, 60)

    const [, roadmapRes, resumeRes, interviewsRes, applicationsRes] =
      await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase
          .from("roadmaps")
          .select("completion_pct")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("resumes")
          .select("score")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("interviews")
          .select("total_score")
          .eq("user_id", user.id)
          .eq("status", "completed"),
        supabase
          .from("applications")
          .select("stage")
          .eq("user_id", user.id),
      ])

    const lastRoadmap = roadmapRes.data
    const lastResume = resumeRes.data
    const interviews = interviewsRes.data || []
    const applications = applicationsRes.data || []

    const dsaScore = null
    const resumeScore = lastResume?.score?.total ?? null
    const interviewScore =
      interviews.length > 0
        ? Math.round(
            interviews.reduce(
              (sum: number, i: { total_score: number }) => sum + (i.total_score || 0),
              0
            ) / interviews.length
          )
        : null
    const aptitudeScore = null
    const communicationScore = null

    const assessedScores = [dsaScore, resumeScore, interviewScore, aptitudeScore, communicationScore].filter(
      (s): s is number => s !== null
    )
    const totalPlacementScore =
      assessedScores.length > 0
        ? Math.round(
            assessedScores.reduce((sum, s) => sum + s, 0) / assessedScores.length
          )
        : null

    const stageCounts: Record<string, number> = {
      applied: 0,
      oa_received: 0,
      interview: 0,
      offer: 0,
      rejected: 0,
    }
    for (const app of applications) {
      const stage = app.stage as string
      if (stage in stageCounts) stageCounts[stage]++
    }

    return NextResponse.json(
      {
        data: {
          placement_score: {
            total: totalPlacementScore,
            breakdown: {
              dsa: { score: dsaScore, status: dsaScore !== null ? "assessed" : "not_assessed" },
              resume: { score: resumeScore, status: resumeScore !== null ? "assessed" : "not_assessed" },
              interview: { score: interviewScore, status: interviewScore !== null ? "assessed" : "not_assessed" },
              aptitude: { score: aptitudeScore, status: "not_assessed" },
              communication: { score: communicationScore, status: "not_assessed" },
            },
          },
          target: {
            score: 85,
            gap: totalPlacementScore ? 85 - totalPlacementScore : 85,
            estimated_weeks: totalPlacementScore ? Math.max(4, Math.round((85 - totalPlacementScore) / 5)) : 12,
          },
          roadmap: {
            completion_pct: lastRoadmap?.completion_pct ?? 0,
          },
          applications: {
            total: applications.length,
            stages: stageCounts,
          },
          interviews: {
            total: interviews.length,
            average_score: interviewScore,
          },
        },
      },
      { status: 200, headers: rlHeaders }
    )
  } catch (err) {
    return handleApiError(err)
  }
}
