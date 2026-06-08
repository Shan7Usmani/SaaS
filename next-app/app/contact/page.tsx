"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AnimatedSection } from "@/components/shared/animated-section"
import { Mail, MapPin, MessageSquare, Clock, Send, Loader2, CheckCircle2, ArrowRight } from "lucide-react"

const contactMethods = [
  {
    icon: Mail,
    label: "Email",
    value: "hello@placementos.com",
    href: "mailto:hello@placementos.com",
  },
  {
    icon: MessageSquare,
    label: "Support",
    value: "Available 24/7",
    href: "#",
  },
  {
    icon: MapPin,
    label: "Location",
    value: "India",
    href: "#",
  },
  {
    icon: Clock,
    label: "Response Time",
    value: "Within 24 hours",
    href: "#",
  },
]

const faqs = [
  {
    q: "Is PlacementOS completely free?",
    a: "Yes! Our core features — roadmap generation, resume analysis, and mock interviews — are completely free. Premium features are optional and exist only to sustain the free tier.",
  },
  {
    q: "Which companies can I prepare for?",
    a: "We cover 50+ companies including Amazon, Google, Microsoft, TCS, Infosys, Flipkart, Uber, and many more. Each company has a tailored preparation roadmap.",
  },
  {
    q: "How does the AI roadmap work?",
    a: "You tell us your target companies, current skill level, and available time. Our AI generates a month-by-month plan with specific topics, resources, and practice problems.",
  },
  {
    q: "Can I track my progress across platforms?",
    a: "Yes! You can sync your LeetCode, GeeksforGeeks, and HackerRank profiles to track all your problem-solving in one place.",
  },
]

export default function ContactPage() {
  const [formState, setFormState] = useState({ name: "", email: "", subject: "", message: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1500))
    setIsSubmitting(false)
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-background">
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
        <section className="relative overflow-hidden border-b border-primary/10 py-20">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,oklch(0.72_0.18_210/0.04)_0%,transparent_50%)]" />
          <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
            <AnimatedSection>
              <span className="rounded-full border border-primary/30 bg-primary/5 px-4 py-1 text-xs font-medium text-primary">
                CONTACT
              </span>
              <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-5xl">Get in Touch</h1>
              <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-lg">
                Have a question, feedback, or just want to say hi? We&apos;d love to hear from you.
              </p>
            </AnimatedSection>
          </div>
        </section>

        {/* Contact methods + Form */}
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid gap-12 md:grid-cols-2">
              {/* Left - Form */}
              <AnimatedSection delay={100}>
                <h2 className="mb-6 text-2xl font-bold">Send Us a Message</h2>
                {submitted ? (
                  <div className="flex flex-col items-center rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-8 text-center">
                    <CheckCircle2 className="mb-3 h-12 w-12 text-emerald-500" />
                    <h3 className="text-lg font-semibold">Message Sent!</h3>
                    <p className="text-muted-foreground mt-1 text-sm">We&apos;ll get back to you within 24 hours.</p>
                    <Button variant="outline" className="mt-4" onClick={() => { setSubmitted(false); setFormState({ name: "", email: "", subject: "", message: "" }) }}>
                      Send Another
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" placeholder="Your name" value={formState.name} onChange={(e) => setFormState((p) => ({ ...p, name: e.target.value }))} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="you@college.edu" value={formState.email} onChange={(e) => setFormState((p) => ({ ...p, email: e.target.value }))} required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input id="subject" placeholder="What's this about?" value={formState.subject} onChange={(e) => setFormState((p) => ({ ...p, subject: e.target.value }))} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea id="message" placeholder="Tell us more..." className="min-h-[140px]" value={formState.message} onChange={(e) => setFormState((p) => ({ ...p, message: e.target.value }))} required />
                    </div>
                    <Button type="submit" disabled={isSubmitting} className="w-full">
                      {isSubmitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="mr-2 h-4 w-4" />
                      )}
                      Send Message
                    </Button>
                  </form>
                )}
              </AnimatedSection>

              {/* Right - Contact info */}
              <AnimatedSection delay={200}>
                <h2 className="mb-6 text-2xl font-bold">Contact Information</h2>
                <div className="space-y-4">
                  {contactMethods.map((method) => (
                    <div key={method.label} className="group flex items-center gap-4 rounded-xl border border-primary/10 bg-card/30 p-4 transition-all hover:border-primary/30">
                      <div className="bg-primary/10 rounded-lg p-2.5">
                        <method.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">{method.label}</p>
                        <p className="text-sm font-medium">{method.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-primary/10 py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <AnimatedSection>
              <div className="mb-4 text-center">
                <span className="rounded-full border border-primary/30 bg-primary/5 px-4 py-1 text-xs font-medium text-primary">
                  FAQ
                </span>
              </div>
              <h2 className="mb-12 text-center text-3xl font-bold tracking-tight">Frequently Asked Questions</h2>
            </AnimatedSection>

            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <AnimatedSection key={faq.q} delay={i * 100}>
                  <details className="group rounded-xl border border-primary/10 bg-card/30 p-5 transition-all open:border-primary/30">
                    <summary className="flex cursor-pointer items-center justify-between gap-4 text-sm font-medium list-none">
                      {faq.q}
                      <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-open:rotate-90" />
                    </summary>
                    <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                      {faq.a}
                    </p>
                  </details>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-primary/10 py-16">
          <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
            <AnimatedSection>
              <h2 className="text-2xl font-bold tracking-tight">Ready to Get Started?</h2>
              <p className="text-muted-foreground mt-2">Join 10,000+ students on PlacementOS.</p>
              <div className="mt-6">
                <Link href="/auth/register">
                  <Button size="lg" className="shadow-2xl shadow-primary/30">
                    Start Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </AnimatedSection>
          </div>
        </section>
      </main>

      <footer className="border-t border-primary/10 py-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 text-xs text-muted-foreground sm:px-6">
          <p>&copy; {new Date().getFullYear()} PlacementOS. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
