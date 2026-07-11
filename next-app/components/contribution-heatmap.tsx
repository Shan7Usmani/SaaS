"use client"

import { useMemo, useSyncExternalStore } from "react"
import { cn } from "@/lib/utils"

const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""]
const CELL_SIZE = 14

function getIntensity(count: number, maxCount: number): string {
  if (count === 0) return "bg-muted"
  const ratio = count / (maxCount || 1)
  if (ratio <= 0.25) return "bg-emerald-200 dark:bg-emerald-900"
  if (ratio <= 0.5) return "bg-emerald-400 dark:bg-emerald-700"
  if (ratio <= 0.75) return "bg-emerald-500 dark:bg-emerald-500"
  return "bg-emerald-600 dark:bg-emerald-400"
}

function subscribeToContributions(callback: () => void) {
  window.addEventListener("dsa-contributions-changed", callback)
  window.addEventListener("storage", callback)
  return () => {
    window.removeEventListener("dsa-contributions-changed", callback)
    window.removeEventListener("storage", callback)
  }
}

let cachedContributions: Record<string, number> = {}
let cachedContributionsStr = ""

function getContributions(): Record<string, number> {
  try {
    const raw = localStorage.getItem("dsa-contributions") || "{}"
    if (raw === cachedContributionsStr) return cachedContributions
    cachedContributionsStr = raw
    cachedContributions = JSON.parse(raw)
    return cachedContributions
  } catch {
    return {}
  }
}

function getEmptyContributions(): Record<string, number> {
  return {}
}

export function ContributionHeatmap() {
  const data = useSyncExternalStore(subscribeToContributions, getContributions, getEmptyContributions)

  const weeks = 20
  const today = new Date()
  const start = new Date(today)
  start.setDate(start.getDate() - weeks * 7)
  start.setHours(0, 0, 0, 0)

  const startMs = start.getTime()
  const todayMs = today.getTime()

  const weeksArray = useMemo(() => {
    const result: { date: string; count: number; day: number }[][] = []
    const cursor = new Date(startMs)
    const maxCount = Math.max(...Object.values(data), 1)
    const end = todayMs

    while (cursor.getTime() <= end) {
      const week: { date: string; count: number; day: number }[] = []
      for (let d = 0; d < 7; d++) {
        const dateStr = cursor.toISOString().slice(0, 10)
        week.push({
          date: dateStr,
          count: data[dateStr] || 0,
          day: cursor.getDay(),
        })
        cursor.setDate(cursor.getDate() + 1)
        if (cursor.getTime() > end) break
      }
      result.push(week)
    }
    return { weeks: result, maxCount }
  }, [data, startMs, todayMs])

  return (
    <div className="w-full overflow-x-auto">
      <div className="inline-flex gap-1">
        <div className="flex flex-col gap-[3px] pt-5">
          {DAY_LABELS.map((label, i) => (
            <div
              key={i}
              className="text-muted-foreground flex h-[14px] items-center pr-1 text-[10px]"
              style={{ lineHeight: `${CELL_SIZE}px` }}
            >
              {label}
            </div>
          ))}
        </div>
        <div className="flex gap-[3px]">
          {weeksArray.weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((day) => (
                <div
                  key={day.date}
                  className={cn("rounded-[3px]", getIntensity(day.count, weeksArray.maxCount))}
                  style={{ width: CELL_SIZE, height: CELL_SIZE }}
                  title={`${day.date}: ${day.count} problem${day.count !== 1 ? "s" : ""}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-2 flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
        <span>Less</span>
        {[0, 0.25, 0.5, 0.75, 1].map((level) => (
          <div
            key={level}
            className={cn(
              "rounded-[2px]",
              level === 0 ? "bg-muted" : level <= 0.25 ? "bg-emerald-200 dark:bg-emerald-900" : level <= 0.5 ? "bg-emerald-400 dark:bg-emerald-700" : level <= 0.75 ? "bg-emerald-500 dark:bg-emerald-500" : "bg-emerald-600 dark:bg-emerald-400"
            )}
            style={{ width: 10, height: 10 }}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  )
}
