import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { handleApiError, unauthorized } from "@/lib/utils/errors"
import { checkRateLimit, getRateLimitHeaders } from "@/lib/utils/rate-limit"

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_MIME = "application/pdf"
const PDF_MAGIC_BYTES = new Uint8Array([0x25, 0x50, 0x44, 0x46])

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw unauthorized()

    const rl = checkRateLimit(`upload:${user.id}`, { maxRequests: 20, windowMs: 60000 })
    const rlHeaders = getRateLimitHeaders(rl.remaining, rl.resetAt, 20)

    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json(
        { error: "No file provided", code: "VALIDATION_ERROR" },
        { status: 422, headers: rlHeaders }
      )
    }

    if (file.type !== ALLOWED_MIME && !file.name.endsWith(".pdf")) {
      return NextResponse.json(
        { error: "Only PDF files are accepted", code: "VALIDATION_ERROR" },
        { status: 422, headers: rlHeaders }
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 5MB limit", code: "VALIDATION_ERROR" },
        { status: 422, headers: rlHeaders }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const magicBytes = new Uint8Array(buffer.slice(0, 4))
    if (
      magicBytes[0] !== PDF_MAGIC_BYTES[0] ||
      magicBytes[1] !== PDF_MAGIC_BYTES[1] ||
      magicBytes[2] !== PDF_MAGIC_BYTES[2] ||
      magicBytes[3] !== PDF_MAGIC_BYTES[3]
    ) {
      return NextResponse.json(
        { error: "File is not a valid PDF", code: "VALIDATION_ERROR" },
        { status: 422, headers: rlHeaders }
      )
    }

    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
    const storagePath = `${user.id}/${Date.now()}_${sanitizedName}`

    const { error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(storagePath, buffer, {
        contentType: "application/pdf",
        upsert: false,
      })

    if (uploadError) {
      return NextResponse.json(
        { error: "Failed to upload file", code: "UPLOAD_ERROR" },
        { status: 500, headers: rlHeaders }
      )
    }

    const { data: signedUrlData } = await supabase.storage
      .from("resumes")
      .createSignedUrl(storagePath, 3600)

    const { data: resume, error: dbError } = await supabase
      .from("resumes")
      .insert({
        user_id: user.id,
        pdf_url: signedUrlData?.signedUrl || "",
        pdf_storage_path: storagePath,
        status: "uploaded",
      })
      .select()
      .single()

    if (dbError) {
      return NextResponse.json(
        { error: "Failed to save resume record", code: "DB_ERROR" },
        { status: 500, headers: rlHeaders }
      )
    }

    return NextResponse.json(
      {
        data: {
          id: resume.id,
          status: "uploaded",
          pdf_url: resume.pdf_url,
          created_at: resume.created_at,
        },
      },
      { status: 201, headers: rlHeaders }
    )
  } catch (err) {
    return handleApiError(err)
  }
}
