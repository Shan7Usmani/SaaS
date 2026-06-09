"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AnimatedSection } from "@/components/shared/animated-section"
import { useIntersectionObserver } from "@/hooks/use-intersection-observer"
import { cn } from "@/lib/utils"
import {
  Target,
  FileText,
  GraduationCap,
  Code2,
  Briefcase,
  Building2,
  ArrowRight,
  Star,
  Quote,
  Mail,
  MapPin,
  ChevronRight,
} from "lucide-react"

function FloatingShape({
  className,
  delay,
  duration,
}: {
  className: string
  delay: number
  duration: number
}) {
  return (
    <div
      className={cn("absolute animate-float rounded-full", className)}
      style={{
        animation: `float ${duration}s ease-in-out ${delay}s infinite`,
      }}
    />
  )
}

function AnimatedCounter({ end, suffix = "" }: { end: number; suffix?: string }) {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.5 })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isVisible) return
    let start = 0
    const step = Math.ceil(end / 60)
    const timer = setInterval(() => {
      start += step
      if (start >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(start)
      }
    }, 25)
    return () => clearInterval(timer)
  }, [isVisible, end])

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  )
}

const features = [
  {
    title: "AI ROADMAP",
    desc: "Personalized month-by-month plan based on your target companies and current level.",
    icon: Target,
    gradient: "from-violet-500 to-purple-600",
  },
  {
    title: "RESUME ANALYZER",
    desc: "Get your resume scored against ATS standards with actionable suggestions.",
    icon: FileText,
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    title: "MOCK INTERVIEWS",
    desc: "Practice with AI-generated questions and receive detailed feedback.",
    icon: GraduationCap,
    gradient: "from-orange-500 to-amber-600",
  },
  {
    title: "DSA TRACKER",
    desc: "Sync with LeetCode/GFG and track progress across difficulty levels.",
    icon: Code2,
    gradient: "from-blue-500 to-cyan-600",
  },
  {
    title: "APP TRACKER",
    desc: "Track every job application from applied to offer in one place.",
    icon: Briefcase,
    gradient: "from-pink-500 to-rose-600",
  },
  {
    title: "COMPANY PREP",
    desc: "Company-specific guides for Amazon, Google, Microsoft, and more.",
    icon: Building2,
    gradient: "from-indigo-500 to-blue-600",
  },
]

const testimonials = [
  {
    name: "Arjun Mehta",
    role: "NIT Trichy, CSE 2025",
    text: "PlacementOS transformed my preparation. The roadmap was spot on for my Amazon interview.",
    rating: 5,
  },
  {
    name: "Priya Sharma",
    role: "DTU, IT 2025",
    text: "The resume analyzer caught issues I'd missed for months. Got shortlisted at 3 companies after fixing them.",
    rating: 5,
  },
  {
    name: "Rahul Verma",
    role: "VIT, ECE 2025",
    text: "Mock interviews with AI feedback were a game-changer. Scored 9/10 in my actual Google interview.",
    rating: 5,
  },
]

const stats = [
  { label: "Active Students", end: 10000, suffix: "+" },
  { label: "Mock Interviews", end: 25000, suffix: "+" },
  { label: "Resumes Analyzed", end: 15000, suffix: "+" },
  { label: "Target Companies", end: 50, suffix: "+" },
]

export default function LandingPage() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-background overflow-x-hidden">
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>

      {/* Mouse-following gradient */}
      <div
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-1000"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, oklch(0.72 0.18 210 / 0.06), transparent 40%)`,
        }}
      />

      {/* Floating shapes */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <FloatingShape className="bg-primary/5 left-[10%] top-[20%] h-64 w-64 blur-3xl" delay={0} duration={8} />
        <FloatingShape className="bg-cyan-500/5 right-[15%] top-[40%] h-48 w-48 blur-3xl" delay={2} duration={10} />
        <FloatingShape className="bg-violet-500/5 left-[20%] bottom-[30%] h-56 w-56 blur-3xl" delay={4} duration={9} />
        <FloatingShape className="bg-emerald-500/5 right-[25%] bottom-[20%] h-40 w-40 blur-3xl" delay={1} duration={11} />
      </div>

      {/* Header */}
      <header className="fixed top-0 z-50 w-full border-b border-primary/10 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-primary flex h-7 w-7 items-center justify-center rounded-full">
              <span className="text-primary-foreground text-xs font-bold">P</span>
            </div>
            <span className="font-bold tracking-tight text-lg">PlacementOS</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
              Home
            </Link>
            <Link href="/about" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
              Contact
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm" className="text-sm">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button size="sm" className="text-sm shadow-lg shadow-primary/20">
                Get Started
                <ChevronRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1">
        {/* Hero */}
        <section ref={heroRef} className="relative flex min-h-[90vh] items-center justify-center overflow-hidden pt-16">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,oklch(0.72_0.18_210/0.04)_0%,transparent_50%),radial-gradient(ellipse_at_70%_50%,oklch(0.72_0.18_210/0.03)_0%,transparent_50%)]" />
          <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
            <AnimatedSection delay={100}>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-5 py-1.5 text-xs font-medium tracking-wide text-primary shadow-[0_0_20px_-5px_oklch(0.72_0.18_210/0.3)]">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                Your AI Placement Coach
              </div>
            </AnimatedSection>

            <AnimatedSection delay={200}>
              <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-7xl">
                From{" "}
                <span className="text-muted-foreground relative">
                  &ldquo;lost&rdquo;
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-muted-foreground/30 rounded-full" />
                </span>
                <br />
                to{" "}
                <span className="bg-gradient-to-r from-primary via-cyan-400 to-primary bg-[length:200%_auto] animate-[gradient-shift_3s_ease_infinite] bg-clip-text text-transparent drop-shadow-[0_0_20px_oklch(0.72_0.18_210/0.3)]">
                  interview-ready
                </span>
              </h1>
            </AnimatedSection>

            <AnimatedSection delay={300}>
              <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg leading-relaxed">
                AI-powered roadmap, resume analysis, mock interviews, and job tracking — built for engineering students. Join <span className="text-foreground font-semibold">10,000+</span> students already placed.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={400}>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/auth/register">
                  <Button size="lg" className="group relative h-12 overflow-hidden px-8 text-base shadow-2xl shadow-primary/30">
                    <span className="relative z-10 flex items-center">
                      Start Free
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button size="lg" variant="outline" className="h-12 px-8 text-base">
                    Sign In
                  </Button>
                </Link>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={500}>
              <div className="mt-12 flex items-center justify-center gap-8 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span className="ml-1 font-medium">4.9</span>
                </div>
                <span>Trusted by students across 500+ colleges</span>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Stats */}
        <section className="relative border-y border-primary/10 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {stats.map((stat, i) => (
                <AnimatedSection key={stat.label} delay={i * 100}>
                  <div className="text-center">
                    <div className="text-4xl font-extrabold tracking-tight md:text-5xl">
                      <AnimatedCounter end={stat.end} suffix={stat.suffix} />
                    </div>
                    <p className="text-muted-foreground mt-1.5 text-sm">{stat.label}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="relative py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <AnimatedSection>
              <div className="mb-4 text-center">
                <span className="rounded-full border border-primary/30 bg-primary/5 px-4 py-1 text-xs font-medium text-primary">
                  FEATURES
                </span>
              </div>
              <h2 className="mb-4 text-center text-3xl font-bold tracking-tight md:text-4xl">
                Everything You Need
              </h2>
              <p className="text-muted-foreground mx-auto mb-16 max-w-2xl text-center">
                One platform to take you from迷茫 to placed.
              </p>
            </AnimatedSection>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, i) => (
                <AnimatedSection key={feature.title} delay={i * 100}>
                  <div className="group relative overflow-hidden rounded-xl border border-primary/10 bg-card/50 p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-[0_0_30px_-10px_oklch(0.72_0.18_210/0.2)] hover:-translate-y-1">
                    <div className={`mb-4 inline-flex rounded-lg bg-gradient-to-br ${feature.gradient} p-2.5 shadow-lg`}>
                      <feature.icon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="mb-2 font-semibold text-sm tracking-wider">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {feature.desc}
                    </p>
                    <div className="from-primary/50 to-transparent absolute inset-0 -z-10 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="relative border-y border-primary/10 py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <AnimatedSection>
              <div className="mb-4 text-center">
                <span className="rounded-full border border-primary/30 bg-primary/5 px-4 py-1 text-xs font-medium text-primary">
                  TESTIMONIALS
                </span>
              </div>
              <h2 className="mb-16 text-center text-3xl font-bold tracking-tight md:text-4xl">
                What Students Say
              </h2>
            </AnimatedSection>

            <div className="grid gap-8 md:grid-cols-3">
              {testimonials.map((t, i) => (
                <AnimatedSection key={t.name} delay={i * 150}>
                  <div className="group relative rounded-xl border border-primary/10 bg-card/30 p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg">
                    <Quote className="text-primary/20 mb-4 h-8 w-8" />
                    <p className="text-sm leading-relaxed">{t.text}</p>
                    <div className="mt-4 flex items-center gap-1">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star key={j} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <div className="mt-4 flex items-center gap-3 border-t border-primary/10 pt-4">
                      <div className="bg-primary/10 flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold">
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{t.name}</p>
                        <p className="text-muted-foreground text-xs">{t.role}</p>
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative py-24">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <AnimatedSection>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                Ready to Crack Your Dream Placement?
              </h2>
              <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-lg">
                Join thousands of students who have transformed their preparation with AI-powered guidance.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/auth/register">
                  <Button size="lg" className="h-12 px-10 text-base shadow-2xl shadow-primary/30">
                    Start Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/about">
                  <Button size="lg" variant="outline" className="h-12 px-10 text-base">
                    Learn More
                  </Button>
                </Link>
              </div>
            </AnimatedSection>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-primary/10">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="bg-primary flex h-7 w-7 items-center justify-center rounded-full">
                  <span className="text-primary-foreground text-xs font-bold">P</span>
                </div>
                <span className="font-bold tracking-tight">PlacementOS</span>
              </Link>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Your AI placement coach. Built for engineering students, powered by artificial intelligence.
              </p>
            </div>
            <div>
              <p className="mb-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Product
              </p>
              <div className="flex flex-col gap-2">
                <Link href="/" className="text-sm hover:text-foreground transition-colors">Home</Link>
                <Link href="/about" className="text-sm hover:text-foreground transition-colors">About</Link>
                <Link href="/contact" className="text-sm hover:text-foreground transition-colors">Contact</Link>
              </div>
            </div>
            <div>
              <p className="mb-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Features
              </p>
              <div className="flex flex-col gap-2">
                <Link href="/roadmap" className="text-sm hover:text-foreground transition-colors">AI Roadmap</Link>
                <Link href="/resume" className="text-sm hover:text-foreground transition-colors">Resume Analyzer</Link>
                <Link href="/interview" className="text-sm hover:text-foreground transition-colors">Mock Interviews</Link>
                <Link href="/dsa" className="text-sm hover:text-foreground transition-colors">DSA Tracker</Link>
              </div>
            </div>
            <div>
              <p className="mb-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Connect
              </p>
              <div className="flex flex-col gap-2">
                <a href="mailto:hello@placementos.com" className="flex items-center gap-2 text-sm hover:text-foreground transition-colors">
                  <Mail className="h-3.5 w-3.5" />
                  hello@placementos.com
                </a>
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  India
                </span>
              </div>
            </div>
          </div>
          <div className="mt-10 border-t border-primary/10 pt-6 text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} PlacementOS. All rights reserved.
          </div>
          <div className="mt-4 text-center">
            <span className="group relative inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 px-5 py-1.5 text-xs font-medium backdrop-blur-sm transition-all duration-500 hover:border-primary/40 hover:shadow-[0_0_25px_-5px_oklch(0.72_0.18_210/0.4)]">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
              </span>
              <span className="bg-gradient-to-r from-primary via-cyan-300 to-primary bg-[length:200%_auto] bg-clip-text text-transparent animate-[gradient-shift_3s_ease_infinite] font-semibold tracking-wide">
                Crafted by Takhi
              </span>
              <span className="ml-0.5 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0.5">
                ✦
              </span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}
