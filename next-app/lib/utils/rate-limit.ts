import { AppError } from "./errors"

const store = new Map<string, { count: number; resetAt: number }>()

interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): { remaining: number; resetAt: number } {
  const now = Date.now()
  const record = store.get(key)

  if (!record || now > record.resetAt) {
    store.set(key, { count: 1, resetAt: now + config.windowMs })
    return { remaining: config.maxRequests - 1, resetAt: now + config.windowMs }
  }

  if (record.count >= config.maxRequests) {
    throw new AppError(
      `Rate limit exceeded. Try again in ${Math.ceil(
        (record.resetAt - now) / 1000
      )}s`,
      "RATE_LIMITED",
      429
    )
  }

  record.count++
  return {
    remaining: config.maxRequests - record.count,
    resetAt: record.resetAt,
  }
}

export function getRateLimitHeaders(
  remaining: number,
  resetAt: number,
  limit: number
): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(limit),
    "X-RateLimit-Remaining": String(remaining),
    "X-RateLimit-Reset": String(Math.ceil(resetAt / 1000)),
  }
}
