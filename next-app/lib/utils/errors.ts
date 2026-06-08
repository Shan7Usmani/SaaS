import { NextResponse } from "next/server"
import { ZodError } from "zod"

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number
  ) {
    super(message)
    this.name = "AppError"
  }
}

export function handleApiError(err: unknown) {
  if (err instanceof AppError) {
    return NextResponse.json(
      { error: err.message, code: err.code },
      { status: err.status }
    )
  }

  if (err instanceof ZodError) {
    return NextResponse.json(
      {
        error: "Validation failed",
        code: "VALIDATION_ERROR",
        details: err.issues.map((e) => ({
          path: e.path.join("."),
          message: e.message,
        })),
      },
      { status: 422 }
    )
  }

  console.error("Unhandled API error:", err)
  return NextResponse.json(
    { error: "Internal server error", code: "INTERNAL_ERROR" },
    { status: 500 }
  )
}

export function unauthorized() {
  return new AppError("Unauthorized", "UNAUTHORIZED", 401)
}

export function notFound(resource = "Resource") {
  return new AppError(`${resource} not found`, "NOT_FOUND", 404)
}

export function rateLimited() {
  return new AppError("Too many requests", "RATE_LIMITED", 429)
}
