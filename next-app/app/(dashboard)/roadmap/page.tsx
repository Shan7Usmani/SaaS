"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useAuth } from "@/providers/auth-provider"
import { RoadmapHeader } from "@/components/features/roadmap/roadmap-header"
import { MonthAccordion } from "@/components/features/roadmap/month-accordion"
import { AiLoadingState, AiRecommendationCard } from "@/components/features/ai/loading-states"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Topic {
  id: string
  name: string
  completed: boolean
  type?: string
  resources?: { title: string; url: string; platform: string }[]
  estimatedHours?: number
}

interface Month {
  month: number
  title: string
  focusArea?: string
  topics: Topic[]
}

const companies = [
  "Amazon SDE-1",
  "Google SWE",
  "Microsoft SDE",
  "TCS Digital",
  "Infosys SES",
  "Flipkart SDE",
]

const preBuiltRoadmaps: Record<string, Month[]> = {
  "Amazon SDE-1": [
    { month: 1, title: "Foundations", focusArea: "Core DSA & Complexity", topics: [
      { id: "a1", name: "Arrays & Hashing", completed: true, type: "dsa", estimatedHours: 8, resources: [{ title: "Arrays — NeetCode", url: "https://neetcode.io", platform: "article" }] },
      { id: "a2", name: "Two Pointers", completed: true, type: "dsa", estimatedHours: 6 },
      { id: "a3", name: "Sliding Window", completed: false, type: "dsa", estimatedHours: 6 },
      { id: "a4", name: "Binary Search", completed: false, type: "dsa", estimatedHours: 5 },
      { id: "a5", name: "Time & Space Complexity", completed: true, type: "dsa", estimatedHours: 3 },
    ]},
    { month: 2, title: "Core Data Structures", focusArea: "Linked Lists, Trees, Heaps", topics: [
      { id: "b1", name: "Linked Lists", completed: true, type: "dsa", estimatedHours: 7 },
      { id: "b2", name: "Stacks & Queues", completed: false, type: "dsa", estimatedHours: 5 },
      { id: "b3", name: "Trees & BST", completed: false, type: "dsa", estimatedHours: 10 },
      { id: "b4", name: "Heaps & Priority Queues", completed: false, type: "dsa", estimatedHours: 5 },
      { id: "b5", name: "HashMaps & Sets", completed: true, type: "dsa", estimatedHours: 4 },
    ]},
    { month: 3, title: "Advanced Topics", focusArea: "Graphs, DP, Greedy", topics: [
      { id: "c1", name: "Graphs (BFS/DFS)", completed: false, type: "dsa", estimatedHours: 12 },
      { id: "c2", name: "Dynamic Programming", completed: false, type: "dsa", estimatedHours: 15 },
      { id: "c3", name: "Greedy Algorithms", completed: false, type: "dsa", estimatedHours: 6 },
      { id: "c4", name: "Backtracking", completed: false, type: "dsa", estimatedHours: 5 },
      { id: "c5", name: "Tries", completed: false, type: "dsa", estimatedHours: 4 },
    ]},
    { month: 4, title: "Interview Prep", focusArea: "Company-specific preparation", topics: [
      { id: "d1", name: "System Design Basics", completed: false, type: "system_design", estimatedHours: 8 },
      { id: "d2", name: "CS Fundamentals", completed: false, type: "behavioral", estimatedHours: 5 },
      { id: "d3", name: "Mock Interviews", completed: false, type: "interview", estimatedHours: 6 },
      { id: "d4", name: "Amazon LP Questions", completed: false, type: "behavioral", estimatedHours: 4 },
      { id: "d5", name: "Company-Specific Patterns", completed: false, type: "dsa", estimatedHours: 6 },
    ]},
  ],
  "Google SWE": [
    { month: 1, title: "Foundations", focusArea: "Arrays, Strings, Recursion", topics: [
      { id: "g1", name: "Arrays & Strings", completed: false, type: "dsa", estimatedHours: 8 },
      { id: "g2", name: "Hash Tables", completed: false, type: "dsa", estimatedHours: 5 },
      { id: "g3", name: "Sorting & Searching", completed: false, type: "dsa", estimatedHours: 7 },
      { id: "g4", name: "Recursion", completed: false, type: "dsa", estimatedHours: 5 },
      { id: "g5", name: "Math & Logic", completed: false, type: "dsa", estimatedHours: 3 },
    ]},
    { month: 2, title: "Data Structures", focusArea: "Trees, Graphs, Tries", topics: [
      { id: "g6", name: "Trees & Graphs", completed: false, type: "dsa", estimatedHours: 12 },
      { id: "g7", name: "Heaps", completed: false, type: "dsa", estimatedHours: 4 },
      { id: "g8", name: "Tries", completed: false, type: "dsa", estimatedHours: 4 },
      { id: "g9", name: "Union-Find", completed: false, type: "dsa", estimatedHours: 3 },
      { id: "g10", name: "Segment Trees", completed: false, type: "dsa", estimatedHours: 3 },
    ]},
    { month: 3, title: "Algorithms", focusArea: "DP, Graphs, String Algorithms", topics: [
      { id: "g11", name: "Dynamic Programming", completed: false, type: "dsa", estimatedHours: 15 },
      { id: "g12", name: "Greedy Algorithms", completed: false, type: "dsa", estimatedHours: 6 },
      { id: "g13", name: "Graph Algorithms", completed: false, type: "dsa", estimatedHours: 10 },
      { id: "g14", name: "String Algorithms", completed: false, type: "dsa", estimatedHours: 5 },
      { id: "g15", name: "Bit Manipulation", completed: false, type: "dsa", estimatedHours: 3 },
    ]},
    { month: 4, title: "Interview Prep", focusArea: "Googleyness & System Design", topics: [
      { id: "g16", name: "System Design", completed: false, type: "system_design", estimatedHours: 10 },
      { id: "g17", name: "Googleyness Questions", completed: false, type: "behavioral", estimatedHours: 4 },
      { id: "g18", name: "Mock Interviews", completed: false, type: "interview", estimatedHours: 8 },
      { id: "g19", name: "Coding Speed Practice", completed: false, type: "dsa", estimatedHours: 5 },
      { id: "g20", name: "Behavioral Questions", completed: false, type: "behavioral", estimatedHours: 4 },
    ]},
  ],
}

export default function RoadmapPage() {
  const { profile } = useAuth()
  const [selectedCompany, setSelectedCompany] = useState("Amazon SDE-1")
  const [isGenerating, setIsGenerating] = useState(false)
  const [months, setMonths] = useState<Month[]>(preBuiltRoadmaps["Amazon SDE-1"])
  const [showRegenerate, setShowRegenerate] = useState(false)

  const totalTopics = months.reduce((sum, m) => sum + m.topics.length, 0)
  const completedTopics = months.reduce((sum, m) => sum + m.topics.filter((t) => t.completed).length, 0)

  const handleCompanyChange = useCallback((company: string | null) => {
    if (!company) return
    setSelectedCompany(company)
    setIsGenerating(true)
    setTimeout(() => {
      const roadmap = preBuiltRoadmaps[company] ?? preBuiltRoadmaps["Amazon SDE-1"]
      setMonths(roadmap.map((m) => ({ ...m, topics: m.topics.map((t) => ({ ...t, completed: false })) })))
      setIsGenerating(false)
    }, 1500)
  }, [])

  const handleToggleTopic = useCallback((monthIndex: number, topicId: string) => {
    setMonths((prev) =>
      prev.map((m, mi) =>
        mi === monthIndex
          ? { ...m, topics: m.topics.map((t) => (t.id === topicId ? { ...t, completed: !t.completed } : t)) }
          : m
      )
    )
  }, [])

  const [genStage, setGenStage] = useState(0)
  const genIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!isGenerating) return
    genIntervalRef.current = setInterval(() => {
      setGenStage((prev) => (prev + 1) % 4)
    }, 800)
    return () => {
      if (genIntervalRef.current) clearInterval(genIntervalRef.current)
    }
  }, [isGenerating])

  const handleRegenerate = useCallback(() => {
    setShowRegenerate(true)
    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
      setShowRegenerate(false)
    }, 2000)
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Placement Roadmap</h1>
          <p className="text-muted-foreground mt-1">
            AI-generated plan personalized for your goals
          </p>
        </div>
        <Select value={selectedCompany} onValueChange={handleCompanyChange}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {companies.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!isGenerating && (
        <RoadmapHeader
          targetCompany={selectedCompany}
          totalTopics={totalTopics}
          completedTopics={completedTopics}
          onRegenerate={handleRegenerate}
          isGenerating={isGenerating}
        />
      )}

      {isGenerating ? (
        <AiLoadingState
          phase={`Generating ${selectedCompany} roadmap`}
          stages={["Analyzing your profile", "Mapping topic dependencies", "Creating month structure", "Adding resources"]}
          currentStage={genStage}
        />
      ) : (
        <MonthAccordion months={months} onToggleTopic={handleToggleTopic} />
      )}

      <AiRecommendationCard
        title="AI Recommendation"
        description={
          selectedCompany === "Amazon SDE-1"
            ? "Based on your progress, focus on Dynamic Programming and Graphs next. These topics appear in 80% of Amazon SDE-1 interviews. Amazon also emphasizes Leadership Principles — start reviewing them early."
            : "Focus on mastering Trees and Graphs — they appear in most Google SWE interviews. Practice coding speed as Google interviews have a fast pace."
        }
        action={{ label: "View Details", onClick: () => {} }}
      />
    </div>
  )
}
