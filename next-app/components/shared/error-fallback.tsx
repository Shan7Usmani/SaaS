"use client"

import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw } from "lucide-react"

interface ErrorFallbackProps {
  title?: string
  message?: string
  onRetry?: () => void
}

export function ErrorFallback({
  title = "Failed to load",
  message = "Something went wrong. Please try again.",
  onRetry,
}: ErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="bg-red-50 mb-4 rounded-full p-4 dark:bg-red-950">
        <AlertCircle className="h-8 w-8 text-red-500" />
      </div>
      <p className="mb-1 text-lg font-semibold">{title}</p>
      <p className="text-muted-foreground mb-4 max-w-md text-center text-sm">{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      )}
    </div>
  )
}
