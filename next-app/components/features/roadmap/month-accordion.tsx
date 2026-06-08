"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronRight, CheckCircle2, Circle, ExternalLink, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"

interface Topic {
  id: string
  name: string
  completed: boolean
  type?: string
  resources?: { title: string; url: string; platform: string }[]
  problems?: { title: string; difficulty: string; platform: string }[]
  estimatedHours?: number
}

interface Month {
  month: number
  title: string
  topics: Topic[]
  milestones?: string[]
  focusArea?: string
}

interface MonthAccordionProps {
  months: Month[]
  onToggleTopic: (monthIndex: number, topicId: string) => void
}

export function MonthAccordion({ months, onToggleTopic }: MonthAccordionProps) {
  const [expanded, setExpanded] = useState<number[]>([0])

  const isExpanded = (i: number) => expanded.includes(i)

  const toggleMonth = (i: number) => {
    setExpanded((prev) =>
      prev.includes(i) ? prev.filter((m) => m !== i) : [...prev, i]
    )
  }

  return (
    <div className="space-y-3">
      {months.map((month, monthIndex) => {
        const completedCount = month.topics.filter((t) => t.completed).length
        const isComplete = completedCount === month.topics.length
        return (
          <Card
            key={monthIndex}
            className={cn("transition-shadow", isComplete && "border-emerald-200 dark:border-emerald-800")}
          >
            <button
              onClick={() => toggleMonth(monthIndex)}
              className="w-full text-left"
            >
              <CardHeader className="flex flex-row items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  {isExpanded(monthIndex) ? (
                    <ChevronDown className="text-muted-foreground h-4 w-4 shrink-0" />
                  ) : (
                    <ChevronRight className="text-muted-foreground h-4 w-4 shrink-0" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">
                        Month {month.month}: {month.title}
                      </CardTitle>
                      {isComplete && (
                        <Badge variant="default" className="h-5 px-1.5 text-[10px]">
                          Done
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground text-xs">
                      {completedCount}/{month.topics.length} topics
                      {month.focusArea ? ` — ${month.focusArea}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-muted h-1.5 w-20 overflow-hidden rounded-full">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        isComplete ? "bg-emerald-500" : "bg-primary"
                      )}
                      style={{ width: `${(completedCount / month.topics.length) * 100}%` }}
                    />
                  </div>
                </div>
              </CardHeader>
            </button>
            {isExpanded(monthIndex) && (
              <CardContent className="pb-4">
                <div className="space-y-1">
                  {month.topics.map((topic) => (
                    <div
                      key={topic.id}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-muted/50",
                        topic.completed && "text-muted-foreground"
                      )}
                    >
                      <button
                        onClick={() => onToggleTopic(monthIndex, topic.id)}
                        className="shrink-0"
                      >
                        {topic.completed ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <Circle className="h-4 w-4" />
                        )}
                      </button>
                      <span className={cn("flex-1", topic.completed && "line-through")}>
                        {topic.name}
                      </span>
                      {topic.type && (
                        <Badge variant="outline" className="text-[10px]">
                          {topic.type}
                        </Badge>
                      )}
                      {topic.estimatedHours && (
                        <span className="text-muted-foreground shrink-0 text-[10px]">
                          ~{topic.estimatedHours}h
                        </span>
                      )}
                      {topic.resources && topic.resources.length > 0 && (
                        <div className="flex items-center gap-1">
                          {topic.resources.slice(0, 2).map((r, ri) => (
                            <a
                              key={ri}
                              href={r.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-muted-foreground hover:text-foreground transition-colors"
                              title={r.title}
                            >
                              {r.platform === "youtube" ? (
                                <BookOpen className="h-3.5 w-3.5" />
                              ) : (
                                <ExternalLink className="h-3.5 w-3.5" />
                              )}
                            </a>
                          ))}
                          {topic.resources.length > 2 && (
                            <span className="text-muted-foreground text-[10px]">
                              +{topic.resources.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        )
      })}
    </div>
  )
}
