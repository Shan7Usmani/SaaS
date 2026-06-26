"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { RoadmapHeader } from "@/components/features/roadmap/roadmap-header"
import { MonthAccordion } from "@/components/features/roadmap/month-accordion"
import { AiRecommendationCard } from "@/components/features/ai/loading-states"
import { SiteHeader } from "@/components/layout/site-header"
import { ArrowRight, Lock, Sparkles } from "lucide-react"

const demoMonths = [
  { month: 1, title: "Foundations", focusArea: "Core DSA & Complexity", topics: [
    { id: "d1", name: "Arrays & Hashing", completed: true, type: "dsa", estimatedHours: 8 },
    { id: "d2", name: "Two Pointers", completed: true, type: "dsa", estimatedHours: 6 },
    { id: "d3", name: "Sliding Window", completed: false, type: "dsa", estimatedHours: 6 },
    { id: "d4", name: "Binary Search", completed: false, type: "dsa", estimatedHours: 5 },
    { id: "d5", name: "Time & Space Complexity", completed: true, type: "dsa", estimatedHours: 3 },
  ]},
  { month: 2, title: "Core Data Structures", focusArea: "Linked Lists, Trees, Heaps", topics: [
    { id: "d6", name: "Linked Lists", completed: true, type: "dsa", estimatedHours: 7 },
    { id: "d7", name: "Stacks & Queues", completed: false, type: "dsa", estimatedHours: 5 },
    { id: "d8", name: "Trees & BST", completed: false, type: "dsa", estimatedHours: 10 },
    { id: "d9", name: "Heaps & Priority Queues", completed: false, type: "dsa", estimatedHours: 5 },
    { id: "d10", name: "HashMaps & Sets", completed: true, type: "dsa", estimatedHours: 4 },
  ]},
  { month: 3, title: "Advanced Topics", focusArea: "Graphs, DP, Greedy", topics: [
    { id: "d11", name: "Graphs (BFS/DFS)", completed: false, type: "dsa", estimatedHours: 12 },
    { id: "d12", name: "Dynamic Programming", completed: false, type: "dsa", estimatedHours: 15 },
    { id: "d13", name: "Greedy Algorithms", completed: false, type: "dsa", estimatedHours: 6 },
    { id: "d14", name: "Backtracking", completed: false, type: "dsa", estimatedHours: 5 },
    { id: "d15", name: "Tries", completed: false, type: "dsa", estimatedHours: 4 },
  ]},
  { month: 4, title: "Interview Prep", focusArea: "Company-specific preparation", topics: [
    { id: "d16", name: "System Design Basics", completed: false, type: "system_design", estimatedHours: 8 },
    { id: "d17", name: "CS Fundamentals", completed: false, type: "behavioral", estimatedHours: 5 },
    { id: "d18", name: "Mock Interviews", completed: false, type: "interview", estimatedHours: 6 },
    { id: "d19", name: "Amazon LP Questions", completed: false, type: "behavioral", estimatedHours: 4 },
    { id: "d20", name: "Company-Specific Patterns", completed: false, type: "dsa", estimatedHours: 6 },
  ]},
]

export default function TrialRoadmapPage() {
  const totalTopics = demoMonths.reduce((sum, m) => sum + m.topics.length, 0)
  const completedTopics = demoMonths.reduce((sum, m) => sum + m.topics.filter((t) => t.completed).length, 0)

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="pt-20 pb-16">
        {/* Trial Banner */}
        <div className="border-b border-primary/10 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
          <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">
                This is a <span className="font-semibold text-foreground">demo preview</span>. Sign up to unlock AI-generated roadmaps for 50+ companies.
              </span>
            </div>
            <Link href="/auth/register">
              <Button size="sm" className="shrink-0 shadow-lg shadow-primary/20">
                Sign Up Free
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-4 pt-8 sm:px-6">
          <RoadmapHeader
            targetCompany="Amazon SDE-1 (Demo)"
            totalTopics={totalTopics}
            completedTopics={completedTopics}
            onRegenerate={() => {}}
            isGenerating={false}
          />

          <div className="mt-6">
            <MonthAccordion months={demoMonths} onToggleTopic={() => {}} />
          </div>

          <div className="mt-6">
            <AiRecommendationCard
              title="AI Recommendation"
              description="Based on your progress, focus on Dynamic Programming and Graphs next. These topics appear in 80% of Amazon SDE-1 interviews. Sign up to get personalized recommendations for your target companies."
              action={{ label: "Get Full Access", onClick: () => window.location.href = "/auth/register" }}
            />
          </div>

          {/* Upgrade CTA */}
          <div className="mt-12 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-8 text-center">
            <div className="bg-primary/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Unlock Your Personalized Roadmap</h2>
            <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm">
              Get AI-generated roadmaps for Amazon, Google, Microsoft, and 50+ companies. Track progress, sync LeetCode, and more.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <Link href="/auth/register">
                <Button size="lg" className="shadow-2xl shadow-primary/30">
                  Create Free Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/features">
                <Button variant="outline" size="lg">
                  Back to Features
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
