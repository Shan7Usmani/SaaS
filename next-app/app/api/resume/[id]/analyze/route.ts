import { NextResponse, after } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { handleApiError, unauthorized, notFound } from "@/lib/utils/errors"
import { checkAILimit } from "@/lib/ai/rate-limiter"
import { callAI } from "@/lib/ai/router"
import { extractTextFromPDF } from "@/lib/pdf/extractor"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw unauthorized()

    await checkAILimit(user.id, "resume_analyze")

    const { data: resume, error: fetchError } = await supabase
      .from("resumes")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (fetchError || !resume) throw notFound("Resume")

    await supabase
      .from("resumes")
      .update({ status: "analyzing" })
      .eq("id", id)

    after(async () => {
      const adminSupabase = (await import("@/lib/supabase/admin")).createAdminClient()

      try {
        let extractedText = ""
        try {
          const response = await fetch(resume.pdf_url)
          const pdfBuffer = await response.arrayBuffer()
          const result = await extractTextFromPDF(pdfBuffer)
          extractedText = result.text.slice(0, 10000)
        } catch {
          extractedText = "PDF text extraction failed. Analyze based on filename."
        }

        const analysisPrompt = `Analyze this resume for a placement-seeking student. Return valid JSON only:
{
  "score": { "total": 0-100, "ats": 0-100, "keywords": 0-100, "projects": 0-100, "skills": 0-100 },
  "suggestions": [{ "category": "skills|projects|ats", "text": "suggestion text" }],
  "missing_keywords": ["keyword1", "keyword2"],
  "word_count": 0
}

Resume content:
${extractedText}`

        const result = await callAI("resume", analysisPrompt)
        const analysis = JSON.parse(result)

        await adminSupabase
          .from("resumes")
          .update({
            status: "completed",
            score: analysis.score,
            suggestions: analysis.suggestions,
            word_count: analysis.word_count || null,
            extracted_text: extractedText.slice(0, 500),
            analyzed_at: new Date().toISOString(),
          })
          .eq("id", id)
      } catch {
        await adminSupabase
          .from("resumes")
          .update({ status: "failed" })
          .eq("id", id)
      }
    })

    return NextResponse.json(
      { data: { id, status: "analyzing" } },
      { status: 200 }
    )
  } catch (err) {
    return handleApiError(err)
  }
}
