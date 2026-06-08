const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3 } as const

type LogLevel = keyof typeof LOG_LEVELS

const currentLevel: LogLevel =
  (process.env.NEXT_PUBLIC_LOG_LEVEL as LogLevel) ||
  (process.env.NODE_ENV === "production" ? "info" : "debug")

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  data?: Record<string, unknown>
  error?: { message: string; stack?: string }
}

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel]
}

function log(level: LogLevel, message: string, data?: Record<string, unknown>) {
  if (!shouldLog(level)) return

  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    data,
  }

  if (level === "error" || level === "warn") {
    const method = level === "error" ? console.error : console.warn
    method(JSON.stringify(entry))
  } else {
    console.log(JSON.stringify(entry))
  }
}

export const logger = {
  debug: (message: string, data?: Record<string, unknown>) =>
    log("debug", message, data),
  info: (message: string, data?: Record<string, unknown>) =>
    log("info", message, data),
  warn: (message: string, data?: Record<string, unknown>) =>
    log("warn", message, data),
  error: (message: string, error?: Error, data?: Record<string, unknown>) => {
    const extra = { ...data }
    if (error) {
      extra.error = { message: error.message, stack: error.stack }
    }
    log("error", message, extra)
  },
}
