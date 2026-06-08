"use client"

import { cn } from "@/lib/utils"
import { Sparkles, Loader2, AlertCircle } from "lucide-react"

interface AiLoadingStateProps {
  phase: string
  stages: string[]
  currentStage: number
}

export function AiLoadingState({ phase, stages, currentStage }: AiLoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="bg-primary/10 mb-6 rounded-full p-4">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
      <p className="mb-1 text-lg font-semibold">{phase}</p>
      <div className="space-y-2">
        {stages.map((stage, i) => (
          <div key={stage} className="flex items-center gap-2 text-sm">
            <div
              className={cn(
                "h-2 w-2 rounded-full",
                i < currentStage && "bg-emerald-500",
                i === currentStage && "bg-primary animate-pulse",
                i > currentStage && "bg-muted-foreground/20"
              )}
            />
            <span
              className={cn(
                i < currentStage && "text-muted-foreground line-through",
                i === currentStage && "text-foreground font-medium",
                i > currentStage && "text-muted-foreground/40"
              )}
            >
              {stage}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function AiErrorState({
  message,
  onRetry,
}: {
  message: string
  onRetry?: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="bg-red-50 mb-4 rounded-full p-4 dark:bg-red-950">
        <AlertCircle className="h-8 w-8 text-red-500" />
      </div>
      <p className="mb-1 text-lg font-semibold">Analysis Failed</p>
      <p className="text-muted-foreground mb-4 text-sm">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-primary hover:text-primary/80 text-sm font-medium underline underline-offset-4"
        >
          Try again
        </button>
      )}
    </div>
  )
}

export function AiRecommendationCard({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: { label: string; onClick: () => void }
}) {
  return (
    <div className="from-primary/5 to-primary/10 flex items-start gap-4 rounded-xl border bg-gradient-to-r p-5 dark:from-primary/10 dark:to-primary/5">
      <div className="bg-primary/10 rounded-lg p-2">
        <Sparkles className="text-primary h-5 w-5" />
      </div>
      <div className="flex-1">
        <p className="font-semibold">{title}</p>
        <p className="text-muted-foreground mt-0.5 text-sm leading-relaxed">{description}</p>
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
