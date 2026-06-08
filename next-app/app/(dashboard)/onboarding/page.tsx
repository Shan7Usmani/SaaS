"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/providers/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Loader2, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

const colleges = [
  "IIT Bombay",
  "IIT Delhi",
  "IIT Madras",
  "NIT Trichy",
  "NIT Surat",
  "DTU",
  "NSUT",
  "IIIT Hyderabad",
  "VIT Vellore",
  "SRM Chennai",
  "Manipal University",
  "BITS Pilani",
  "Other",
]

const branches = [
  "Computer Science",
  "Information Technology",
  "Electronics & Communication",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "AI & Data Science",
  "Other",
]

const years = ["1st Year", "2nd Year", "3rd Year", "4th Year", "Graduated"]

const targetCompanies = [
  "Amazon",
  "Microsoft",
  "Google",
  "TCS",
  "Infosys",
  "Wipro",
  "Accenture",
  "Flipkart",
  "Uber",
  "Stripe",
  "Startups",
  "Off-Campus",
]

const dsaLevels = [
  { value: "beginner", label: "Beginner", desc: "New to DSA, < 20 problems" },
  {
    value: "intermediate",
    label: "Intermediate",
    desc: "Know basics, 20-100 problems",
  },
  {
    value: "advanced",
    label: "Advanced",
    desc: "Comfortable with most topics, 100+ problems",
  },
]

const roles = [
  {
    value: "swe",
    label: "Software Engineer",
    icon: "💻",
    desc: "DSA, System Design, CS Fundamentals",
  },
  {
    value: "data",
    label: "Data Analyst",
    icon: "📊",
    desc: "SQL, Statistics, Python, Visualization",
  },
  {
    value: "ai",
    label: "AI Engineer",
    icon: "🤖",
    desc: "ML, Deep Learning, NLP, Computer Vision",
  },
  {
    value: "web",
    label: "Web Developer",
    icon: "🌐",
    desc: "Frontend, Backend, Full-stack, DevOps",
  },
]

const steps = [
  "College",
  "Branch & Year",
  "CGPA",
  "Target Companies",
  "DSA Level",
  "Preferred Role",
  "Review",
]

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    college: "",
    branch: "",
    year: "",
    cgpa: "",
    target_companies: [] as string[],
    dsa_level: "",
    preferred_role: "",
  })
  const { user, refreshProfile } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  function update(field: string, value: string | string[]) {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  function toggleCompany(company: string) {
    setFormData((prev) => ({
      ...prev,
      target_companies: prev.target_companies.includes(company)
        ? prev.target_companies.filter((c) => c !== company)
        : [...prev.target_companies, company],
    }))
  }

  async function handleSubmit() {
    if (!user) return
    setIsLoading(true)

    await supabase.from("profiles").upsert({
      id: user.id,
      name: formData.name,
      college: formData.college,
      branch: formData.branch,
      year: formData.year,
      cgpa: formData.cgpa ? Number(formData.cgpa) : null,
      target_companies: formData.target_companies,
      dsa_level: formData.dsa_level,
      preferred_role: formData.preferred_role,
      onboarding_completed: true,
    })

    await refreshProfile()
    setIsLoading(false)
    router.push("/dashboard")
  }

  const progress = ((step + 1) / steps.length) * 100

  return (
    <div className="mx-auto max-w-2xl py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Welcome to PlacementOS</h1>
        <p className="text-muted-foreground mt-2">
          Let&apos;s set up your personalized placement journey
        </p>
      </div>

      <Progress value={progress} className="mb-8" />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="bg-primary text-primary-foreground flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium">
              {step + 1}
            </span>
            {steps[step]}
          </CardTitle>
          <CardDescription>
            {step === 0 && "What's your name and college?"}
            {step === 1 && "Tell us about your academic background"}
            {step === 2 && "What's your current CGPA? (optional)"}
            {step === 3 && "Which companies are you targeting?"}
            {step === 4 && "How comfortable are you with DSA?"}
            {step === 5 && "What role are you preparing for?"}
            {step === 6 && "Review your information before we start"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 0 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  placeholder="Arjun Sharma"
                  value={formData.name}
                  onChange={(e) => update("name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>College</Label>
                <div className="grid grid-cols-2 gap-2">
                  {colleges.map((college) => (
                    <Button
                      key={college}
                      variant={
                        formData.college === college ? "default" : "outline"
                      }
                      className="justify-start"
                      onClick={() => update("college", college)}
                    >
                      {college}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Branch</Label>
                <div className="grid grid-cols-2 gap-2">
                  {branches.map((branch) => (
                    <Button
                      key={branch}
                      variant={
                        formData.branch === branch ? "default" : "outline"
                      }
                      className="justify-start"
                      onClick={() => update("branch", branch)}
                    >
                      {branch}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Year</Label>
                <div className="grid grid-cols-3 gap-2">
                  {years.map((year) => (
                    <Button
                      key={year}
                      variant={
                        formData.year === year ? "default" : "outline"
                      }
                      onClick={() => update("year", year)}
                    >
                      {year}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-2">
              <Label>Current CGPA (out of 10)</Label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="10"
                placeholder="8.5"
                value={formData.cgpa}
                onChange={(e) => update("cgpa", e.target.value)}
              />
              <p className="text-muted-foreground text-xs">
                Optional — helps us personalize your roadmap
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-2">
              <Label>Select target companies</Label>
              <div className="grid grid-cols-2 gap-2">
                {targetCompanies.map((company) => (
                  <Button
                    key={company}
                    variant={
                      formData.target_companies.includes(company)
                        ? "default"
                        : "outline"
                    }
                    className="justify-start"
                    onClick={() => toggleCompany(company)}
                  >
                    {formData.target_companies.includes(company) && (
                      <Check className="mr-2 h-4 w-4" />
                    )}
                    {company}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3">
              {dsaLevels.map((level) => (
                <Button
                  key={level.value}
                  variant={
                    formData.dsa_level === level.value ? "default" : "outline"
                  }
                  className="h-auto w-full flex-col items-start gap-1 p-4"
                  onClick={() => update("dsa_level", level.value)}
                >
                  <span className="font-medium">{level.label}</span>
                  <span className="text-muted-foreground text-xs">
                    {level.desc}
                  </span>
                </Button>
              ))}
            </div>
          )}

          {step === 5 && (
            <div className="grid grid-cols-2 gap-3">
              {roles.map((role) => (
                <Button
                  key={role.value}
                  variant={
                    formData.preferred_role === role.value
                      ? "default"
                      : "outline"
                  }
                  className="h-auto flex-col items-center gap-2 p-6"
                  onClick={() => update("preferred_role", role.value)}
                >
                  <span className="text-2xl">{role.icon}</span>
                  <span className="font-medium">{role.label}</span>
                  <span className="text-muted-foreground text-xs text-center">
                    {role.desc}
                  </span>
                </Button>
              ))}
            </div>
          )}

          {step === 6 && (
            <div className="space-y-3">
              {[
                { label: "Name", value: formData.name },
                { label: "College", value: formData.college },
                { label: "Branch", value: formData.branch },
                { label: "Year", value: formData.year },
                { label: "CGPA", value: formData.cgpa || "Not provided" },
                {
                  label: "Target Companies",
                  value: formData.target_companies.join(", "),
                },
                {
                  label: "DSA Level",
                  value:
                    dsaLevels.find((l) => l.value === formData.dsa_level)
                      ?.label ?? "",
                },
                {
                  label: "Preferred Role",
                  value:
                    roles.find((r) => r.value === formData.preferred_role)
                      ?.label ?? "",
                },
              ].map((item) => (
                <div key={item.label} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        <div className="flex justify-between p-6 pt-0">
          <Button
            variant="outline"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
          >
            Back
          </Button>
          {step < steps.length - 1 ? (
            <Button onClick={() => setStep((s) => s + 1)}>Continue</Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Start My Journey
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
