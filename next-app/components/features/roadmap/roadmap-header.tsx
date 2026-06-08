"use client"

import { Button } from "@/components/ui/button"
import { RefreshCw, Target, Calendar } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface RoadmapHeaderProps {
  targetCompany: string
  totalTopics: number
  completedTopics: number
  onRegenerate: () => void
  isGenerating: boolean
}

export function RoadmapHeader({
  targetCompany,
  totalTopics,
  completedTopics,
  onRegenerate,
  isGenerating,
}: RoadmapHeaderProps) {
  const progress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="md:col-span-2">
        <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
          <Target className="h-4 w-4" />
          Target: <span className="font-medium text-foreground">{targetCompany}</span>
        </div>
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold">{completedTopics}/{totalTopics}</span>
          <span className="text-muted-foreground text-sm">topics completed</span>
        </div>
        <Progress value={progress} className="mt-2 h-2.5" />
        <div className="mt-1.5 flex items-center gap-4 text-xs text-muted-foreground">
          <span>{progress}% complete</span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {4 - Math.floor(progress / 25)} months remaining
          </span>
        </div>
      </div>
      <div className="flex items-end justify-end">
        <Button variant="outline" onClick={onRegenerate} disabled={isGenerating}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} />
          Regenerate
        </Button>
      </div>
    </div>
  )
}
