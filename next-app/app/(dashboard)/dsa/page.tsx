"use client"

import { useState, useMemo } from "react"
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
  Search,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { dsaTopics } from "@/data/dsa-sheet"
import { Input } from "@/components/ui/input"

const companyColors: Record<string, string> = {
  Amazon: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300 border-orange-200 dark:border-orange-800",
  Microsoft: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  Google: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300 border-green-200 dark:border-green-800",
  Adobe: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 border-red-200 dark:border-red-800",
  Apple: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700",
  Meta: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
  Facebook: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
  Netflix: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 border-red-200 dark:border-red-800",
  LinkedIn: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  Twitter: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 border-sky-200 dark:border-sky-800",
  Bloomberg: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300 border-orange-200 dark:border-orange-800",
  Goldman: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  Morgan: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-purple-200 dark:border-purple-800",
  Walmart: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800",
  Flipkart: "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300 border-pink-200 dark:border-pink-800",
  Oracle: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 border-red-200 dark:border-red-800",
  IBM: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  Accolite: "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300 border-teal-200 dark:border-teal-800",
  Cisco: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800",
  Visa: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 border-sky-200 dark:border-sky-800",
  PayPal: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  Salesforce: "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300 border-teal-200 dark:border-teal-800",
  Samsung: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  SAP: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300 border-orange-200 dark:border-orange-800",
  Qualcomm: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-purple-200 dark:border-purple-800",
  Intel: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  VMware: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  Uber: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700",
  Snapdeal: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border-rose-200 dark:border-rose-800",
  Hike: "bg-lime-100 text-lime-700 dark:bg-lime-950 dark:text-lime-300 border-lime-200 dark:border-lime-800",
  MakeMyTrip: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300 border-violet-200 dark:border-violet-800",
  OYO: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 border-red-200 dark:border-red-800",
  Paytm: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800",
  Directi: "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-950 dark:text-fuchsia-300 border-fuchsia-200 dark:border-fuchsia-800",
  Infosys: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 border-sky-200 dark:border-sky-800",
  TCS: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700",
}

function getCompanyColor(company: string): string {
  const key = Object.keys(companyColors).find(
    (k) => company.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(company.toLowerCase())
  )
  return key ? companyColors[key] : "bg-muted text-muted-foreground border-border"
}

const difficultyColors: Record<string, string> = {
  Easy: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950",
  Medium: "text-amber-500 bg-amber-50 dark:bg-amber-950",
  Hard: "text-red-500 bg-red-50 dark:bg-red-950",
}

const platformShort: Record<string, string> = {
  LeetCode: "LC",
  GeeksforGeeks: "GFG",
  CodeChef: "CC",
}

export default function DSATrackerPage() {
  const [problemStatus, setProblemStatus] = useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") return {}
    try {
      const saved = localStorage.getItem("dsa-progress")
      return saved ? JSON.parse(saved) : {}
    } catch { return {} }
  })
  const [streak, setStreak] = useState(() => {
    if (typeof window === "undefined") return 0
    try {
      const saved = localStorage.getItem("dsa-streak")
      return saved ? Number(JSON.parse(saved)) : 0
    } catch { return 0 }
  })
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState(dsaTopics[0]?.id ?? "arrays")

  const allProblems = useMemo(
    () => dsaTopics.flatMap((t) => t.problems),
    []
  )

  const filteredTopics = useMemo(() => {
    if (!search.trim()) return dsaTopics
    const q = search.toLowerCase()
    return dsaTopics
      .map((topic) => ({
        ...topic,
        problems: topic.problems.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            p.companies.some((c) => c.toLowerCase().includes(q))
        ),
      }))
      .filter((t) => t.problems.length > 0)
  }, [search])

  const stats = useMemo(() => {
    const solved = allProblems.filter((p) => problemStatus[p.id]).length
    const byDifficulty = (d: string) => ({
      total: allProblems.filter((p) => p.difficulty === d).length,
      solved: allProblems.filter((p) => p.difficulty === d && problemStatus[p.id]).length,
    })
    return {
      total: allProblems.length,
      solved,
      easy: byDifficulty("Easy"),
      medium: byDifficulty("Medium"),
      hard: byDifficulty("Hard"),
    }
  }, [allProblems, problemStatus])

  const safeTab = filteredTopics.find((t) => t.id === activeTab)
    ? activeTab
    : filteredTopics[0]?.id ?? "arrays"

  const toggleProblem = (id: string) => {
    setProblemStatus((prev) => {
      const wasCompleted = prev[id]
      const next = { ...prev, [id]: !prev[id] }
      localStorage.setItem("dsa-progress", JSON.stringify(next))

      if (!wasCompleted) {
        const todayStr = new Date().toISOString().slice(0, 10)
        const todayReadable = new Date().toDateString()
        const lastActive = localStorage.getItem("dsa-last-active")
        if (lastActive !== todayReadable) {
          setStreak((prevStreak) => {
            const yesterday = new Date(Date.now() - 86400000).toDateString()
            const nextStreak = lastActive === yesterday ? prevStreak + 1 : 1
            localStorage.setItem("dsa-streak", JSON.stringify(nextStreak))
            localStorage.setItem("dsa-last-active", todayReadable)
            return nextStreak
          })
        }

        const contributions = JSON.parse(localStorage.getItem("dsa-contributions") || "{}")
        contributions[todayStr] = (contributions[todayStr] || 0) + 1
        localStorage.setItem("dsa-contributions", JSON.stringify(contributions))
        window.dispatchEvent(new Event("dsa-contributions-changed"))
      }

      return next
    })
  }

  const completionPercent = stats.total > 0 ? Math.round((stats.solved / stats.total) * 100) : 0
  const mastery =
    completionPercent >= 80 ? "Expert" : completionPercent >= 50 ? "Intermediate" : completionPercent >= 25 ? "Apprentice" : "Beginner"
  const masteryMsg =
    completionPercent >= 80 ? "Interview ready!" : completionPercent >= 50 ? "Good progress" : "Keep practicing"

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Apna College DSA Sheet</h1>
          <p className="text-muted-foreground mt-1">
            375 handpicked questions covering all topics for placement preparation
          </p>
        </div>
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
          <div className="border-b px-4 pt-4 pb-3">
            <div className="relative">
              <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Search problems or companies..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <Tabs value={safeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b px-4 pt-2">
              <TabsList className="w-full flex-nowrap justify-start overflow-x-auto">
                {filteredTopics.map((cat) => {
                  const solved = cat.problems.filter((p) => problemStatus[p.id]).length
                  return (
                    <TabsTrigger
                      key={cat.id}
                      value={cat.id}
                      className="shrink-0 gap-2 whitespace-nowrap"
                    >
                      {cat.name}
                      <Badge variant="outline" className="ml-1 text-[10px]">
                        {solved}/{cat.problems.length}
                      </Badge>
                    </TabsTrigger>
                  )
                })}
              </TabsList>
            </div>

            {filteredTopics.map((cat) => {
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
                    {cat.problems.map((problem, idx) => {
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
                          <span className="text-muted-foreground shrink-0 text-[10px] font-mono w-5 text-right">
                            {idx + 1}.
                          </span>
                          <span className={cn("flex-1 min-w-0 truncate", done && "line-through")}>
                            {problem.title}
                          </span>
                          {problem.companies.length > 0 && (
                            <div className="hidden md:flex items-center gap-1 shrink-0 max-w-[200px] overflow-hidden">
                              {problem.companies.slice(0, 3).map((company) => (
                                <Badge
                                  key={company}
                                  variant="outline"
                                  className={cn("text-[9px] px-1.5 py-0 leading-normal font-normal", getCompanyColor(company))}
                                >
                                  {company}
                                </Badge>
                              ))}
                              {problem.companies.length > 3 && (
                                <span className="text-muted-foreground text-[10px]">
                                  +{problem.companies.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                          <Badge
                            variant="outline"
                            className={cn("text-[10px] font-normal shrink-0", difficultyColors[problem.difficulty])}
                          >
                            {problem.difficulty}
                          </Badge>
                          <span className="text-muted-foreground shrink-0 text-[10px] font-mono">
                            {platformShort[problem.platform]}
                          </span>
                          <a
                            href={problem.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground shrink-0 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
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
