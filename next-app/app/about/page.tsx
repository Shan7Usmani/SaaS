"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AnimatedSection } from "@/components/shared/animated-section"
import { ArrowRight, Target, Eye, Heart, Users, Sparkles } from "lucide-react"

const team = [
  { name: "Aditi Sharma", role: "Founder & CEO", bio: "Ex-Google, passionate about democratizing placement prep for every engineering student." },
  { name: "Rohan Patel", role: "CTO", bio: "Built AI systems at Microsoft. Believes AI can level the playing field for college placements." },
  { name: "Neha Gupta", role: "Head of AI", bio: "PhD in NLP. Designs the interview evaluation and resume analysis algorithms." },
  { name: "Vikram Singh", role: "Product Lead", bio: "Former placement coordinator at IIT Delhi. Knows exactly what students need." },
]

const milestones = [
  { year: "2024 Q3", event: "Idea born in a hostel room" },
  { year: "2024 Q4", event: "MVP launched at 3 colleges" },
  { year: "2025 Q1", event: "1,000 active users" },
  { year: "2025 Q2", event: "AI roadmap generator goes live" },
  { year: "2025 Q3", event: "5,000 students onboarded" },
  { year: "2025 Q4", event: "Resume analyzer + mock interviews launched" },
  { year: "2026 Q1", event: "10,000+ students, 500+ colleges" },
  { year: "2026 Q2", event: "Full platform release" },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Simple header */}
      <header className="border-b border-primary/10 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-primary flex h-6 w-6 items-center justify-center rounded-full">
              <span className="text-primary-foreground text-[10px] font-bold">P</span>
            </div>
            <span className="font-bold tracking-tight">PlacementOS</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Sign In</Link>
            <Link href="/auth/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-primary/10 py-24">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,oklch(0.72_0.18_210/0.04)_0%,transparent_50%)]" />
          <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
            <AnimatedSection>
              <span className="rounded-full border border-primary/30 bg-primary/5 px-4 py-1 text-xs font-medium text-primary">
                ABOUT US
              </span>
              <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-5xl">
                Leveling the Playing Field for Every Student
              </h1>
              <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg leading-relaxed">
                We believe every engineering student deserves access to world-class placement preparation — regardless of their college, background, or budget.
              </p>
            </AnimatedSection>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid gap-8 md:grid-cols-2">
              <AnimatedSection delay={100}>
                <div className="rounded-xl border border-primary/10 bg-card/30 p-8">
                  <div className="bg-primary/10 mb-4 inline-flex rounded-lg p-3">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="mb-3 text-2xl font-bold">Our Mission</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    To make AI-powered placement preparation accessible to every engineering student in India. We bridge the gap between tier-1 and tier-3 colleges by providing personalized roadmaps, resume analysis, and mock interviews at zero cost.
                  </p>
                </div>
              </AnimatedSection>
              <AnimatedSection delay={200}>
                <div className="rounded-xl border border-primary/10 bg-card/30 p-8">
                  <div className="bg-primary/10 mb-4 inline-flex rounded-lg p-3">
                    <Eye className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="mb-3 text-2xl font-bold">Our Vision</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    A future where no student misses a placement opportunity due to lack of guidance. We envision PlacementOS as the definitive platform that every engineering student uses to crack their dream job.
                  </p>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Story / Timeline */}
        <section className="border-y border-primary/10 py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <AnimatedSection>
              <div className="mb-4 text-center">
                <span className="rounded-full border border-primary/30 bg-primary/5 px-4 py-1 text-xs font-medium text-primary">
                  OUR STORY
                </span>
              </div>
              <h2 className="mb-4 text-center text-3xl font-bold tracking-tight">From Hostel Room to Launch</h2>
              <p className="text-muted-foreground mx-auto mb-12 max-w-xl text-center">
                PlacementOS started when our founder realized that students outside top-tier colleges had no structured way to prepare for placements.
              </p>
            </AnimatedSection>

            <div className="relative space-y-0">
              <div className="absolute left-4 top-0 h-full w-px bg-primary/20 md:left-1/2 md:-translate-x-px" />
              {milestones.map((m, i) => (
                <AnimatedSection key={m.year} delay={i * 100}>
                  <div className={`relative flex items-start gap-6 pb-12 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
                    <div className="bg-background border-primary/30 absolute left-4 z-10 flex h-3 w-3 -translate-x-1.5 items-center justify-center rounded-full border-2 md:left-1/2 md:-translate-x-1.5">
                      <div className="bg-primary h-1.5 w-1.5 rounded-full" />
                    </div>
                    <div className={`ml-10 md:ml-0 md:w-1/2 ${i % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12"}`}>
                      <span className="text-primary text-xs font-semibold tracking-wider">{m.year}</span>
                      <p className="mt-1 text-sm">{m.event}</p>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <AnimatedSection>
              <div className="mb-4 text-center">
                <span className="rounded-full border border-primary/30 bg-primary/5 px-4 py-1 text-xs font-medium text-primary">
                  VALUES
                </span>
              </div>
              <h2 className="mb-12 text-center text-3xl font-bold tracking-tight">What Drives Us</h2>
            </AnimatedSection>

            <div className="grid gap-6 md:grid-cols-3">
              {[
                { icon: Heart, title: "Access First", desc: "We prioritize free access. Premium features exist only to sustain the free tier." },
                { icon: Sparkles, title: "AI-Powered Personalization", desc: "One size doesn't fit all. Every roadmap, every analysis is tailored to you." },
                { icon: Users, title: "Community Over Competition", desc: "We help students help each other. Study groups, peer reviews, and shared progress." },
              ].map((v, i) => (
                <AnimatedSection key={v.title} delay={i * 100}>
                  <div className="rounded-xl border border-primary/10 bg-card/30 p-6 text-center">
                    <div className="bg-primary/10 mx-auto mb-4 inline-flex rounded-lg p-3">
                      <v.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="mb-2 font-semibold">{v.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{v.desc}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="border-t border-primary/10 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <AnimatedSection>
              <div className="mb-4 text-center">
                <span className="rounded-full border border-primary/30 bg-primary/5 px-4 py-1 text-xs font-medium text-primary">
                  TEAM
                </span>
              </div>
              <h2 className="mb-4 text-center text-3xl font-bold tracking-tight">Meet the Team</h2>
              <p className="text-muted-foreground mx-auto mb-12 max-w-xl text-center">
                A small team on a big mission.
              </p>
            </AnimatedSection>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {team.map((member, i) => (
                <AnimatedSection key={member.name} delay={i * 100}>
                  <div className="group rounded-xl border border-primary/10 bg-card/30 p-6 text-center transition-all hover:border-primary/30 hover:shadow-lg">
                    <div className="bg-gradient-to-br from-primary to-cyan-500 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold text-white shadow-lg">
                      {member.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <h3 className="font-semibold">{member.name}</h3>
                    <p className="text-primary text-xs font-medium">{member.role}</p>
                    <p className="text-muted-foreground mt-3 text-xs leading-relaxed">{member.bio}</p>
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
              <h2 className="text-3xl font-bold tracking-tight">Start Your Placement Journey Today</h2>
              <p className="text-muted-foreground mx-auto mt-4 max-w-lg">
                Join 10,000+ students already using PlacementOS to crack their dream companies.
              </p>
              <div className="mt-8">
                <Link href="/auth/register">
                  <Button size="lg" className="h-12 px-10 text-base shadow-2xl shadow-primary/30">
                    Get Started Free
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
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 text-xs text-muted-foreground sm:px-6">
          <p>&copy; {new Date().getFullYear()} PlacementOS. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
