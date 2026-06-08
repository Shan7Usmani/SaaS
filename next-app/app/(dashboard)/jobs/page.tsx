"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Briefcase,
  Building2,
  MapPin,
  Clock,
  ExternalLink,
  Bookmark,
  Search,
  Filter,
  GraduationCap,
  IndianRupee,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Job {
  id: string
  company: string
  role: string
  location: string
  salary: string
  type: "Full-time" | "Internship" | "Contract"
  experience: string
  posted: string
  deadline: string
  tags: string[]
  saved: boolean
  logo: string
}

const jobs: Job[] = [
  {
    id: "j1",
    company: "Amazon",
    role: "SDE-1",
    location: "Bengaluru, India",
    salary: "30-40 LPA",
    type: "Full-time",
    experience: "0-2 years",
    posted: "2 days ago",
    deadline: "2026-07-15",
    tags: ["React", "Node.js", "AWS", "DSA"],
    saved: false,
    logo: "AMZ",
  },
  {
    id: "j2",
    company: "Google",
    role: "Software Engineer",
    location: "Hyderabad, India",
    salary: "35-50 LPA",
    type: "Full-time",
    experience: "0-3 years",
    posted: "1 week ago",
    deadline: "2026-07-30",
    tags: ["Java", "Python", "System Design", "DSA"],
    saved: true,
    logo: "GGL",
  },
  {
    id: "j3",
    company: "Microsoft",
    role: "SWE Intern",
    location: "Bengaluru, India",
    salary: "1-1.5 L/month",
    type: "Internship",
    experience: "Pre-final year",
    posted: "3 days ago",
    deadline: "2026-06-20",
    tags: ["C#", "Azure", "DSA"],
    saved: false,
    logo: "MS",
  },
  {
    id: "j4",
    company: "Flipkart",
    role: "SDE-1",
    location: "Bengaluru, India",
    salary: "25-35 LPA",
    type: "Full-time",
    experience: "0-2 years",
    posted: "5 days ago",
    deadline: "2026-07-10",
    tags: ["Java", "Spring", "DSA", "System Design"],
    saved: false,
    logo: "FLP",
  },
  {
    id: "j5",
    company: "TCS",
    role: "Digital",
    location: "Multiple Locations",
    salary: "7-12 LPA",
    type: "Full-time",
    experience: "Fresher",
    posted: "1 day ago",
    deadline: "2026-06-30",
    tags: ["Any Stream", "DSA", "CS Fundamentals"],
    saved: false,
    logo: "TCS",
  },
  {
    id: "j6",
    company: "Infosys",
    role: "SES",
    location: "Pune, India",
    salary: "8-14 LPA",
    type: "Full-time",
    experience: "Fresher",
    posted: "1 week ago",
    deadline: "2026-07-05",
    tags: ["Any Stream", "DSA", "Aptitude"],
    saved: true,
    logo: "INF",
  },
]

const typeColors: Record<string, string> = {
  "Full-time": "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
  Internship: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
  Contract: "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
}

export default function JobsPage() {
  const [savedJobs, setSavedJobs] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    jobs.forEach((j) => {
      initial[j.id] = j.saved
    })
    return initial
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<string>("all")

  const toggleSaved = (id: string) => {
    setSavedJobs((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesType = filterType === "all" || job.type === filterType
    return matchesSearch && matchesType
  })

  const savedCount = Object.values(savedJobs).filter(Boolean).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Jobs</h1>
        <p className="text-muted-foreground mt-1">
          Discover placement opportunities at top companies
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search companies, roles, or skills..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={filterType} onValueChange={(v) => {
            if (v !== null) setFilterType(v)
          }}>
          <SelectTrigger className="w-full sm:w-40">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Full-time">Full-time</SelectItem>
            <SelectItem value="Internship">Internship</SelectItem>
            <SelectItem value="Contract">Contract</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="bg-primary/10 rounded-lg p-2">
              <Briefcase className="text-primary h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{jobs.length}</p>
              <p className="text-muted-foreground text-xs">Total Jobs</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-lg bg-emerald-50 p-2 dark:bg-emerald-950">
              <Building2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {new Set(jobs.map((j) => j.company)).size}
              </p>
              <p className="text-muted-foreground text-xs">Companies</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-lg bg-amber-50 p-2 dark:bg-amber-950">
              <Bookmark className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{savedCount}</p>
              <p className="text-muted-foreground text-xs">Saved</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Jobs List */}
      <div className="space-y-3">
        {filteredJobs.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center py-12 text-center">
              <Search className="text-muted-foreground mb-4 h-12 w-12" />
              <p className="font-medium">No jobs found</p>
              <p className="text-muted-foreground mt-1 text-sm">
                Try adjusting your search or filters
              </p>
            </CardContent>
          </Card>
        )}

        {filteredJobs.map((job) => {
          const isSaved = savedJobs[job.id]
          return (
            <Card key={job.id} className="hover:bg-accent/50 transition-colors">
              <CardContent className="flex items-start gap-4 p-4">
                <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-lg font-mono text-sm font-bold">
                  {job.logo}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold">{job.role}</h3>
                      <p className="text-muted-foreground text-sm">
                        {job.company}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => toggleSaved(job.id)}
                    >
                      <Bookmark
                        className={cn(
                          "h-4 w-4",
                          isSaved && "fill-amber-500 text-amber-500"
                        )}
                      />
                    </Button>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <IndianRupee className="h-3 w-3" />
                      {job.salary}
                    </span>
                    <span className="flex items-center gap-1">
                      <GraduationCap className="h-3 w-3" />
                      {job.experience}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {job.posted}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {job.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-[10px]">
                        {tag}
                      </Badge>
                    ))}
                    <Badge
                      variant="outline"
                      className={cn("text-[10px] font-normal", typeColors[job.type])}
                    >
                      {job.type}
                    </Badge>
                  </div>
                </div>

                <div className="hidden flex-col items-end gap-2 sm:flex">
                  <Button variant="outline" size="sm" className="gap-1.5">
                    Apply <ExternalLink className="h-3 w-3" />
                  </Button>
                  <span className="text-muted-foreground text-[10px]">
                    Closes {job.deadline}
                  </span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

