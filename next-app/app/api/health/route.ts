import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  const start = Date.now()
  const checks: Record<string, "ok" | "error"> = {}

  try {
    const supabase = await createServerSupabaseClient()
    const { error } = await supabase.from("profiles").select("id").limit(1)
    checks.database = error ? "error" : "ok"
  } catch {
    checks.database = "error"
  }

  const status = Object.values(checks).every((c) => c === "ok")
    ? "healthy"
    : "degraded"

  return NextResponse.json(
    {
      status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.VERCEL_ENV || process.env.NODE_ENV,
      checks,
      responseTimeMs: Date.now() - start,
    },
    { status: status === "healthy" ? 200 : 503 }
  )
}
