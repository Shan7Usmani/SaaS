"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ResumeResults } from "@/components/features/resume/resume-results"
import { SiteHeader } from "@/components/layout/site-header"
import { ArrowRight, Lock, Sparkles } from "lucide-react"

const sampleResult = {
  score: 68,
  ats: 72,
  keywords: 55,
  projects: 65,
  skills: 80,
  missing: [
    "React Native", "TypeScript", "CI/CD", "Docker",
    "GraphQL", "Agile/Scrum", "System Design", "Unit Testing",
  ],
  suggestions: [
    {
      priority: "high" as const,
      category: "Experience",
      issue: "Weak action verbs in experience section",
      fix: "Replace passive phrases like 'was involved in' with strong action verbs: 'Led', 'Architected', 'Optimized', 'Delivered'. Each bullet should start with a powerful verb and include a measurable outcome.",
      impact: "Can improve score by 8-12 points — recruiters scan for impact verbs in seconds",
    },
    {
      priority: "high" as const,
      category: "Keywords",
      issue: "Missing critical keywords for SDE roles",
      fix: "Add keywords like TypeScript, Docker, CI/CD, and GraphQL to your skills section and weave them into experience bullets. Use the exact terms from job descriptions.",
      impact: "ATS pass rate increases significantly — most companies filter by keyword match",
    },
    {
      priority: "medium" as const,
      category: "Projects",
      issue: "Project descriptions lack technical depth",
      fix: "For each project, specify: tech stack, your role, key challenges solved, and quantifiable results. Add a link to live demo or GitHub repo.",
      impact: "Helps recruiters assess your hands-on ability beyond coursework",
    },
    {
      priority: "medium" as const,
      category: "Formatting",
      issue: "Resume exceeds recommended 1-page limit",
      fix: "Consolidate older internships into a single 'Early Experience' section. Reduce bullet points for positions older than 2 years to 2-3 each.",
      impact: "Recruiters spend ~6 seconds per resume — concise formatting increases read-through rate",
    },
    {
      priority: "low" as const,
      category: "Education",
      issue: "CGPA not highlighted prominently",
      fix: "Move CGPA next to your degree name. If CGPA is above 8.0, bold it. Add relevant coursework in a single line below.",
      impact: "Small improvement — helps with companies that have CGPA filters",
    },
  ],
  weakSections: ["Experience — weak action verbs", "Projects — missing technical depth", "Skills — keyword gaps for SDE roles"],
}

export default function TrialResumePage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="pt-20 pb-16">
        {/* Trial Banner */}
        <div className="border-b border-primary/10 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">
                This is a <span className="font-semibold text-foreground">sample analysis</span>. Upload your resume to get a personalized ATS score with actionable suggestions.
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

        <div className="mx-auto max-w-5xl px-4 pt-8 sm:px-6">
          <ResumeResults result={sampleResult} onReset={() => {}} />

          {/* Upgrade CTA */}
          <div className="mt-12 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-8 text-center">
            <div className="bg-primary/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Analyze Your Resume Now</h2>
            <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm">
              Upload your resume and get a personalized ATS score, keyword gap analysis, and actionable suggestions to maximize your shortlist chances.
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
