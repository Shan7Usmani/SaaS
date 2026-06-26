"use client"

import Link from "next/link"
import { ArrowRight, Target, FileText, GraduationCap, Code2, Briefcase, Building2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AnimatedSection } from "@/components/shared/animated-section"
import { SiteHeader } from "@/components/layout/site-header"

const features = [
  {
    title: "AI Roadmap",
    desc: "Tell us your target companies, current skill level, and available time. Our AI generates a month-by-month personalized plan with specific topics, resources, and practice problems tailored to you.",
    icon: Target,
    gradient: "from-violet-500 to-purple-600",
    highlights: [
      "Company-specific roadmaps (Amazon, Google, Microsoft, 50+)",
      "Smart topic sequencing based on your strengths",
      "Curated resources — articles, videos, practice problems",
      "Progress tracking with weekly adjustments",
    ],
    href: "/trial/roadmap",
  },
  {
    title: "Resume Analyzer",
    desc: "Upload your resume and get an ATS-grade score with actionable feedback. Our AI checks structure, keywords, impact metrics, and more to maximize your shortlist chances.",
    icon: FileText,
    gradient: "from-emerald-500 to-teal-600",
    highlights: [
      "ATS compatibility score with detailed breakdown",
      "Keyword gap analysis against your target roles",
      "Actionable suggestions for every section",
      "Side-by-side compare before and after",
    ],
    href: "/trial/resume",
  },
  {
    title: "Mock Interviews",
    desc: "Practice with AI-generated questions tailored to the companies you're targeting. Get instant feedback on your answers, timing, and areas to improve.",
    icon: GraduationCap,
    gradient: "from-orange-500 to-amber-600",
    highlights: [
      "Company-specific question banks",
      "Real-time AI feedback on your responses",
      "Structured scoring across multiple dimensions",
      "Progress history to track improvement",
    ],
    href: "/interview",
  },
  {
    title: "DSA Tracker",
    desc: "Sync your LeetCode, GeeksforGeeks, and HackerRank profiles. Track your problem-solving progress across difficulty levels and identify weak areas.",
    icon: Code2,
    gradient: "from-blue-500 to-cyan-600",
    highlights: [
      "Cross-platform progress sync",
      "Topic-wise breakdown of solved problems",
      "Weak area identification with targeted recommendations",
      "Daily streaks and milestone tracking",
    ],
    href: "/dsa",
  },
  {
    title: "Application Tracker",
    desc: "Never lose track of a job application. Log every application, monitor stage progression, and get a bird's-eye view of your placement pipeline.",
    icon: Briefcase,
    gradient: "from-pink-500 to-rose-600",
    highlights: [
      "Visual pipeline from Applied to Offer",
      "Stage-wise status tracking with timestamps",
      "Company and role-level organization",
      "Dashboard with aggregate stats and trends",
    ],
    href: "/applications",
  },
  {
    title: "Company Prep",
    desc: "Company-specific guides covering interview patterns, typical questions, preparation timelines, and curated resources for 50+ top tech companies.",
    icon: Building2,
    gradient: "from-indigo-500 to-blue-600",
    highlights: [
      "Interview pattern deep-dives per company",
      "Curated company-wise preparation roadmaps",
      "Tips from past interview experiences",
      "Regularly updated with latest hiring trends",
    ],
    href: "/roadmap",
  },
]

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-primary/10 pt-32 pb-20">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,oklch(0.72_0.18_210/0.04)_0%,transparent_50%)]" />
          <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
            <AnimatedSection>
              <span className="rounded-full border border-primary/30 bg-primary/5 px-4 py-1 text-xs font-medium text-primary">
                EVERYTHING YOU NEED
              </span>
              <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-5xl">
                One Platform, Zero Hassle
              </h1>
              <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg leading-relaxed">
                From roadmap generation to mock interviews — PlacementOS brings every tool you need
                to crack your dream placement into a single dashboard.
              </p>
            </AnimatedSection>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid gap-8 md:grid-cols-2">
              {features.map((feature, i) => (
                <AnimatedSection key={feature.title} delay={i * 100}>
                  <div className="group relative flex flex-col rounded-xl border border-primary/10 bg-card/50 p-8 transition-all duration-300 hover:border-primary/30 hover:shadow-[0_0_30px_-10px_oklch(0.72_0.18_210/0.2)] hover:-translate-y-1 h-full">
                    <div className="flex items-start gap-4 mb-5">
                      <div className={`inline-flex rounded-lg bg-gradient-to-br ${feature.gradient} p-3 shadow-lg shrink-0`}>
                        <feature.icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold">{feature.title}</h2>
                        <p className="text-muted-foreground text-sm leading-relaxed mt-1">
                          {feature.desc}
                        </p>
                      </div>
                    </div>

                    <ul className="space-y-2 mb-6 flex-1">
                      {feature.highlights.map((h) => (
                        <li key={h} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Sparkles className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                          {h}
                        </li>
                      ))}
                    </ul>

                    <Link href={feature.href}>
                      <Button variant={feature.href.startsWith("/trial") ? "default" : "outline"} size="sm" className="w-full group/btn">
                        {feature.href.startsWith("/trial") ? "Try Free" : "Open"} {feature.title}
                        <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                      </Button>
                    </Link>

                    <div className="from-primary/50 to-transparent absolute inset-0 -z-10 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100 rounded-xl" />
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-primary/10 py-20">
          <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
            <AnimatedSection>
              <h2 className="text-3xl font-bold tracking-tight">Ready to Get Started?</h2>
              <p className="text-muted-foreground mx-auto mt-4 max-w-lg">
                Join 10,000+ students already using PlacementOS. It&apos;s free, forever.
              </p>
              <div className="mt-8">
                <Link href="/auth/register">
                  <Button size="lg" className="h-12 px-10 text-base shadow-2xl shadow-primary/30">
                    Start Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </AnimatedSection>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-primary/10 py-8">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-2 px-4 text-center text-xs text-muted-foreground sm:px-6 md:grid-cols-3">
          <p className="md:text-left">&copy; {new Date().getFullYear()} PlacementOS. All rights reserved.</p>
          <div className="md:text-center">
            <span className="group inline-flex items-center justify-center gap-1.5 transition-all duration-500 hover:text-primary">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
              </span>
              <span className="bg-gradient-to-r from-primary via-cyan-300 to-primary bg-[length:200%_auto] bg-clip-text text-transparent animate-[gradient-shift_3s_ease_infinite] font-semibold tracking-wide">
                Crafted by Shan Usmani
              </span>
              <span className="ml-0.5 opacity-0 transition-all duration-300 group-hover:opacity-100">✦</span>
            </span>
          </div>
          <div className="flex justify-center gap-4 md:justify-end">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
