"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CheckCircle2,
  Circle,
  Flame,
  Code2,
  ExternalLink,
  Trophy,
  TrendingUp,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Problem {
  id: string
  title: string
  difficulty: "Easy" | "Medium" | "Hard"
  platform: "LeetCode" | "GeeksforGeeks" | "Codeforces" | "HackerRank"
  completed: boolean
}

interface Category {
  id: string
  name: string
  icon: string
  problems: Problem[]
}

const categories: Category[] = [
  {
    id: "arrays",
    name: "Arrays & Hashing",
    icon: "[]",
    problems: [
      { id: "a1", title: "Two Sum", difficulty: "Easy", platform: "LeetCode", completed: true },
      { id: "a2", title: "Contains Duplicate", difficulty: "Easy", platform: "LeetCode", completed: true },
      { id: "a3", title: "Product of Array Except Self", difficulty: "Medium", platform: "LeetCode", completed: true },
      { id: "a4", title: "Valid Anagram", difficulty: "Easy", platform: "LeetCode", completed: true },
      { id: "a5", title: "Group Anagrams", difficulty: "Medium", platform: "LeetCode", completed: false },
      { id: "a6", title: "Top K Frequent Elements", difficulty: "Medium", platform: "LeetCode", completed: false },
      { id: "a7", title: "Longest Consecutive Sequence", difficulty: "Medium", platform: "LeetCode", completed: false },
    ],
  },
  {
    id: "two-pointers",
    name: "Two Pointers",
    icon: "<->",
    problems: [
      { id: "tp1", title: "Valid Palindrome", difficulty: "Easy", platform: "LeetCode", completed: true },
      { id: "tp2", title: "Two Sum II", difficulty: "Medium", platform: "LeetCode", completed: true },
      { id: "tp3", title: "3Sum", difficulty: "Medium", platform: "LeetCode", completed: false },
      { id: "tp4", title: "Trapping Rain Water", difficulty: "Hard", platform: "LeetCode", completed: false },
    ],
  },
  {
    id: "sliding-window",
    name: "Sliding Window",
    icon: "===",
    problems: [
      { id: "sw1", title: "Best Time to Buy & Sell Stock", difficulty: "Easy", platform: "LeetCode", completed: true },
      { id: "sw2", title: "Longest Substring Without Repeating", difficulty: "Medium", platform: "LeetCode", completed: true },
      { id: "sw3", title: "Minimum Window Substring", difficulty: "Hard", platform: "LeetCode", completed: false },
    ],
  },
  {
    id: "trees",
    name: "Trees & Graphs",
    icon: "/\\",
    problems: [
      { id: "t1", title: "Invert Binary Tree", difficulty: "Easy", platform: "LeetCode", completed: true },
      { id: "t2", title: "Maximum Depth of Binary Tree", difficulty: "Easy", platform: "LeetCode", completed: true },
      { id: "t3", title: "Same Tree", difficulty: "Easy", platform: "LeetCode", completed: true },
      { id: "t4", title: "Validate BST", difficulty: "Medium", platform: "LeetCode", completed: false },
      { id: "t5", title: "Number of Islands", difficulty: "Medium", platform: "LeetCode", completed: false },
    ],
  },
  {
    id: "dp",
    name: "Dynamic Programming",
    icon: "DP",
    problems: [
      { id: "dp1", title: "Climbing Stairs", difficulty: "Easy", platform: "LeetCode", completed: true },
      { id: "dp2", title: "House Robber", difficulty: "Medium", platform: "LeetCode", completed: true },
      { id: "dp3", title: "Coin Change", difficulty: "Medium", platform: "LeetCode", completed: false },
      { id: "dp4", title: "Longest Increasing Subsequence", difficulty: "Medium", platform: "LeetCode", completed: false },
      { id: "dp5", title: "Longest Common Subsequence", difficulty: "Medium", platform: "LeetCode", completed: false },
    ],
  },
  {
    id: "sorting",
    name: "Sorting & Searching",
    icon: "^^",
    problems: [
      { id: "s1", title: "Binary Search", difficulty: "Easy", platform: "LeetCode", completed: true },
      { id: "s2", title: "Search in Rotated Sorted Array", difficulty: "Medium", platform: "LeetCode", completed: true },
      { id: "s3", title: "Merge Intervals", difficulty: "Medium", platform: "LeetCode", completed: false },
      { id: "s4", title: "Median of Two Sorted Arrays", difficulty: "Hard", platform: "LeetCode", completed: false },
    ],
  },
  {
    id: "stack",
    name: "Stack & Queue",
    icon: "||",
    problems: [
      { id: "st1", title: "Valid Parentheses", difficulty: "Easy", platform: "LeetCode", completed: true },
      { id: "st2", title: "Min Stack", difficulty: "Medium", platform: "LeetCode", completed: false },
      { id: "st3", title: "LRU Cache", difficulty: "Medium", platform: "LeetCode", completed: false },
    ],
  },
]

const difficultyColors: Record<string, string> = {
  Easy: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950",
  Medium: "text-amber-500 bg-amber-50 dark:bg-amber-950",
  Hard: "text-red-500 bg-red-50 dark:bg-red-950",
}

const platformShort: Record<string, string> = {
  LeetCode: "LC",
  GeeksforGeeks: "GFG",
  Codeforces: "CF",
  HackerRank: "HR",
}

export default function DSATrackerPage() {
  const [problemStatus, setProblemStatus] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    categories.forEach((cat) =>
      cat.problems.forEach((p) => {
        initial[p.id] = p.completed
      })
    )
    return initial
  })
  const [streak] = useState(7)

  const allProblems = categories.flatMap((c) => c.problems)

  const stats = {
    total: allProblems.length,
    solved: allProblems.filter((p) => problemStatus[p.id]).length,
    easy: {
      total: allProblems.filter((p) => p.difficulty === "Easy").length,
      solved: allProblems.filter((p) => p.difficulty === "Easy" && problemStatus[p.id]).length,
    },
    medium: {
      total: allProblems.filter((p) => p.difficulty === "Medium").length,
      solved: allProblems.filter((p) => p.difficulty === "Medium" && problemStatus[p.id]).length,
    },
    hard: {
      total: allProblems.filter((p) => p.difficulty === "Hard").length,
      solved: allProblems.filter((p) => p.difficulty === "Hard" && problemStatus[p.id]).length,
    },
  }

  const toggleProblem = (id: string) => {
    setProblemStatus((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const completionPercent = stats.total > 0 ? Math.round((stats.solved / stats.total) * 100) : 0
  const mastery =
    completionPercent >= 80 ? "Expert" : completionPercent >= 50 ? "Intermediate" : completionPercent >= 25 ? "Apprentice" : "Beginner"
  const masteryMsg =
    completionPercent >= 80 ? "Interview ready!" : completionPercent >= 50 ? "Good progress" : "Keep practicing"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">DSA Tracker</h1>
        <p className="text-muted-foreground mt-1">
          Track your Data Structures & Algorithms preparation
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Problems Solved</CardTitle>
            <Code2 className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.solved}</div>
            <p className="text-muted-foreground mt-1 text-xs">
              out of {stats.total} problems
            </p>
            <Progress value={completionPercent} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Streak</CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{streak} days</div>
            <p className="text-muted-foreground mt-1 text-xs">
              Keep the momentum going!
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Easy / Medium / Hard</CardTitle>
            <TrendingUp className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              {(["easy", "medium", "hard"] as const).map((level) => (
                <div key={level} className="flex items-center justify-between text-xs">
                  <span className={level === "easy" ? "text-emerald-500" : level === "medium" ? "text-amber-500" : "text-red-500"}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </span>
                  <span>
                    {stats[level].solved}/{stats[level].total}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Mastery Level</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{mastery}</div>
            <p className="text-muted-foreground mt-1 text-xs">
              {completionPercent}% complete &mdash; {masteryMsg}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Tabs defaultValue={categories[0].id} className="w-full">
            <div className="border-b px-4 pt-2">
              <TabsList className="w-full flex-nowrap justify-start overflow-x-auto">
                {categories.map((cat) => {
                  const solved = cat.problems.filter((p) => problemStatus[p.id]).length
                  return (
                    <TabsTrigger
                      key={cat.id}
                      value={cat.id}
                      className="shrink-0 gap-2 whitespace-nowrap"
                    >
                      <span className="text-xs font-mono">{cat.icon}</span>
                      {cat.name}
                      <Badge variant="outline" className="ml-1 text-[10px]">
                        {solved}/{cat.problems.length}
                      </Badge>
                    </TabsTrigger>
                  )
                })}
              </TabsList>
            </div>

            {categories.map((cat) => {
              const solved = cat.problems.filter((p) => problemStatus[p.id]).length
              return (
                <TabsContent key={cat.id} value={cat.id} className="p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-muted-foreground text-sm">
                      {solved} of {cat.problems.length} solved
                    </p>
                    <Progress
                      value={(solved / cat.problems.length) * 100}
                      className="h-1.5 w-24"
                    />
                  </div>
                  <div className="space-y-1">
                    {cat.problems.map((problem) => {
                      const done = problemStatus[problem.id]
                      return (
                        <div
                          key={problem.id}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-muted/50",
                            done && "text-muted-foreground"
                          )}
                        >
                          <button onClick={() => toggleProblem(problem.id)} className="shrink-0">
                            {done ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            ) : (
                              <Circle className="h-4 w-4" />
                            )}
                          </button>
                          <span className={cn("flex-1", done && "line-through")}>
                            {problem.title}
                          </span>
                          <Badge
                            variant="outline"
                            className={cn("text-[10px] font-normal", difficultyColors[problem.difficulty])}
                          >
                            {problem.difficulty}
                          </Badge>
                          <span className="text-muted-foreground shrink-0 text-[10px] font-mono">
                            {platformShort[problem.platform]}
                          </span>
                          <button className="text-muted-foreground hover:text-foreground shrink-0 transition-colors">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </TabsContent>
              )
            })}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
