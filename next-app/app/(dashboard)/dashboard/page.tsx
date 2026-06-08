"use client"

import { useAuth } from "@/providers/auth-provider"
import { useDashboard } from "@/hooks/use-dashboard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ArrowRight,
  Target,
  Code2,
  FileText,
  GraduationCap,
  Brain,
  MessageSquare,
  AlertCircle,
  RefreshCw,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

const quickActions = [
  {
    title: "Generate Roadmap",
    href: "/roadmap",
    icon: Target,
    color: "text-violet-500",
    bg: "bg-violet-50 dark:bg-violet-950",
  },
  {
    title: "Practice DSA",
    href: "/dsa",
    icon: Code2,
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950",
  },
  {
    title: "Analyze Resume",
    href: "/resume",
    icon: FileText,
    color: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-950",
  },
  {
    title: "Mock Interview",
    href: "/interview",
    icon: GraduationCap,
    color: "text-orange-500",
    bg: "bg-orange-50 dark:bg-orange-950",
  },
  {
    title: "Aptitude Practice",
    href: "/aptitude",
    icon: Brain,
    color: "text-pink-500",
    bg: "bg-pink-50 dark:bg-pink-950",
  },
  {
    title: "Track Applications",
    href: "/applications",
    icon: MessageSquare,
    color: "text-cyan-500",
    bg: "bg-cyan-50 dark:bg-cyan-950",
  },
]

function ScoreCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className="mb-2 h-8 w-16" />
        <Skeleton className="h-2 w-full" />
        <Skeleton className="mt-1 h-3 w-32" />
      </CardContent>
    </Card>
  )
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="bg-red-50 mb-4 rounded-full p-4 dark:bg-red-950">
        <AlertCircle className="h-8 w-8 text-red-500" />
      </div>
      <p className="mb-1 text-lg font-semibold">Failed to load dashboard</p>
      <p className="text-muted-foreground mb-4 text-sm">
        Could not fetch your placement data. Please try again.
      </p>
      <Button variant="outline" onClick={onRetry}>
        <RefreshCw className="mr-2 h-4 w-4" />
        Retry
      </Button>
    </div>
  )
}

export default function DashboardPage() {
  const { profile, isLoading: authLoading } = useAuth()
  const { data, isLoading, error, refetch } = useDashboard()

  if (authLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <ScoreCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return <ErrorState onRetry={() => refetch()} />
  }

  const breakdown = data?.placement_score?.breakdown
  const totalScore = data?.placement_score?.total ?? null
  const targetScore = data?.target?.score ?? 85
  const gap = data?.target?.gap ?? targetScore

  const scoreItems: { label: string; value: number | null; status: string | undefined }[] = [
    { label: "DSA Progress", value: breakdown?.dsa?.score ?? null, status: breakdown?.dsa?.status },
    { label: "Resume Score", value: breakdown?.resume?.score ?? null, status: breakdown?.resume?.status },
    { label: "Interview Score", value: breakdown?.interview?.score ?? null, status: breakdown?.interview?.status },
    { label: "Aptitude", value: breakdown?.aptitude?.score ?? null, status: breakdown?.aptitude?.status },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome{profile?.name ? `, ${profile.name}` : ""} 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s your placement readiness overview
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Placement Score</CardTitle>
            <Target className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <>
                <Skeleton className="mb-2 h-8 w-16" />
                <Skeleton className="h-2 w-full" />
              </>
            ) : (
              <>
                <div className="text-3xl font-bold">{totalScore ?? "—"}/100</div>
                {totalScore !== null && (
                  <>
                    <Progress value={totalScore} className="mt-2" />
                    <p className="text-muted-foreground mt-1 text-xs">
                      {gap > 0
                        ? `${gap} points to target of ${targetScore}+`
                        : "Target achieved!"}
                    </p>
                  </>
                )}
                {totalScore === null && (
                  <p className="text-muted-foreground mt-1 text-xs">
                    Complete assessments to calculate your score
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {scoreItems.map((item) => (
          <Card key={item.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{item.label}</CardTitle>
              {item.status === "not_assessed" && (
                <span className="text-muted-foreground text-[10px] uppercase tracking-wider">
                  Pending
                </span>
              )}
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <>
                  <Skeleton className="mb-2 h-7 w-12" />
                  <Skeleton className="h-2 w-full" />
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {item.value !== null ? `${item.value}%` : "—"}
                  </div>
                  {item.value !== null && <Progress value={item.value} className="mt-2" />}
                  {item.value === null && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                      <AlertCircle className="h-3 w-3" />
                      {item.status === "not_assessed" ? "Not yet assessed" : "No data"}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Applications</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-16" />
            ) : (
              <div className="space-y-2">
                <p className="text-2xl font-bold">{data?.applications?.total ?? 0}</p>
                <p className="text-muted-foreground text-sm">Total applications tracked</p>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Mock Interviews</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-16" />
            ) : (
              <div className="space-y-2">
                <p className="text-2xl font-bold">{data?.interviews?.total ?? 0}</p>
                <p className="text-muted-foreground text-sm">
                  {data?.interviews?.total
                    ? data.interviews.average_score !== null
                      ? `Avg score: ${data.interviews.average_score}%`
                      : "Completed interviews"
                    : "No interviews yet"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-4 text-xl font-semibold">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Card className="hover:bg-accent cursor-pointer transition-colors">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className={cn("rounded-lg p-2", action.bg)}>
                    <action.icon className={cn("h-5 w-5", action.color)} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{action.title}</p>
                  </div>
                  <ArrowRight className="text-muted-foreground h-4 w-4" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {!profile?.onboarding_completed && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium">Complete your profile</p>
              <p className="text-muted-foreground text-sm">
                Set up your preferences for a personalized experience
              </p>
            </div>
            <Link href="/onboarding">
              <Button>
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
