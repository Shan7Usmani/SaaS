"use client"

import { cn } from "@/lib/utils"

interface ScoreDisplayProps {
  value: number
  size?: "sm" | "md" | "lg"
  label?: string
  showProgress?: boolean
}

export function ScoreDisplay({ value, size = "md", label, showProgress = true }: ScoreDisplayProps) {
  const circumference = 2 * Math.PI * 60
  const offset = circumference - (value / 100) * circumference

  const color =
    value >= 80 ? "stroke-emerald-500" : value >= 50 ? "stroke-amber-500" : "stroke-red-500"

  const sizes = {
    sm: { svg: 80, stroke: 6, text: "text-lg", label: "text-xs" },
    md: { svg: 140, stroke: 8, text: "text-3xl", label: "text-sm" },
    lg: { svg: 180, stroke: 10, text: "text-4xl", label: "text-base" },
  }

  const s = sizes[size]

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: s.svg, height: s.svg }}>
        <svg className="h-full w-full -rotate-90" viewBox="0 0 140 140">
          <circle
            cx="70"
            cy="70"
            r={60}
            fill="none"
            stroke="currentColor"
            strokeWidth={s.stroke}
            className="text-muted stroke-current opacity-10"
          />
          <circle
            cx="70"
            cy="70"
            r={60}
            fill="none"
            stroke="currentColor"
            strokeWidth={s.stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={cn("transition-all duration-1000 ease-out", color)}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn("font-bold", s.text)}>{value}</span>
        </div>
      </div>
      {label && <span className={cn("text-muted-foreground", s.label)}>{label}</span>}
      {showProgress && (
        <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
          <div
            className={cn("h-full rounded-full transition-all duration-1000 ease-out", color)}
            style={{ width: `${value}%` }}
          />
        </div>
      )}
    </div>
  )
}
