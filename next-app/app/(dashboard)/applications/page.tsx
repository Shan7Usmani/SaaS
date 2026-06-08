"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Plus,
  Building2,
  CalendarDays,
  ExternalLink,
  Trash2,
} from "lucide-react"

const stages = [
  { value: "applied", label: "Applied", color: "bg-blue-500" },
  { value: "oa", label: "OA Received", color: "bg-amber-500" },
  { value: "interview", label: "Interview", color: "bg-violet-500" },
  { value: "offer", label: "Offer", color: "bg-emerald-500" },
  { value: "rejected", label: "Rejected", color: "bg-red-500" },
] as const

interface Application {
  id: string
  company: string
  role: string
  stage: (typeof stages)[number]["value"]
  applied_date: string
  notes: string
}

const initialApps: Application[] = [
  {
    id: "1",
    company: "Amazon",
    role: "SDE-1",
    stage: "interview",
    applied_date: "2026-05-15",
    notes: "Online assessment completed. Waiting for interview.",
  },
  {
    id: "2",
    company: "Microsoft",
    role: "Software Engineer",
    stage: "oa",
    applied_date: "2026-05-20",
    notes: "OA received, need to complete by June 5.",
  },
  {
    id: "3",
    company: "Google",
    role: "SWE Intern",
    stage: "applied",
    applied_date: "2026-05-25",
    notes: "Application submitted via referral.",
  },
  {
    id: "4",
    company: "TCS",
    role: "Digital",
    stage: "offer",
    applied_date: "2026-04-10",
    notes: "Offer received! Decision pending.",
  },
]

export default function ApplicationsPage() {
  const [applications, setApplications] = useState(initialApps)
  const [isOpen, setIsOpen] = useState(false)
  const [newApp, setNewApp] = useState({
    company: "",
    role: "",
    stage: "applied" as (typeof stages)[number]["value"],
    applied_date: new Date().toISOString().split("T")[0],
    notes: "",
  })

  const addApplication = () => {
    if (!newApp.company || !newApp.role) return
    setApplications((prev) => [
      ...prev,
      { ...newApp, id: Date.now().toString() },
    ])
    setNewApp({
      company: "",
      role: "",
      stage: "applied",
      applied_date: new Date().toISOString().split("T")[0],
      notes: "",
    })
    setIsOpen(false)
  }

  const deleteApplication = (id: string) => {
    setApplications((prev) => prev.filter((a) => a.id !== id))
  }

  const updateStage = (id: string, stage: (typeof stages)[number]["value"]) => {
    setApplications((prev) =>
      prev.map((a) => (a.id === id ? { ...a, stage } : a))
    )
  }

  const stageCounts = stages.map((stage) => ({
    ...stage,
    count: applications.filter((a) => a.stage === stage.value).length,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Application Tracker
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your job applications like a CRM
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger
            render={
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Application
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Application</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Company</Label>
                <Input
                  placeholder="Amazon"
                  value={newApp.company}
                  onChange={(e) =>
                    setNewApp((prev) => ({ ...prev, company: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Input
                  placeholder="SDE-1"
                  value={newApp.role}
                  onChange={(e) =>
                    setNewApp((prev) => ({ ...prev, role: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Stage</Label>
                <Select
                  value={newApp.stage}
                  onValueChange={(v) =>
                    setNewApp((prev) => ({
                      ...prev,
                      stage: v as (typeof stages)[number]["value"],
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {stages.map((stage) => (
                      <SelectItem key={stage.value} value={stage.value}>
                        {stage.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Applied Date</Label>
                <Input
                  type="date"
                  value={newApp.applied_date}
                  onChange={(e) =>
                    setNewApp((prev) => ({
                      ...prev,
                      applied_date: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Input
                  placeholder="Any notes..."
                  value={newApp.notes}
                  onChange={(e) =>
                    setNewApp((prev) => ({ ...prev, notes: e.target.value }))
                  }
                />
              </div>
              <Button className="w-full" onClick={addApplication}>
                Add
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {stageCounts.map((stage) => (
          <Card key={stage.value}>
            <CardContent className="p-4 text-center">
              <div className={`mx-auto mb-2 h-2 w-8 rounded-full ${stage.color}`} />
              <p className="text-2xl font-bold">{stage.count}</p>
              <p className="text-muted-foreground text-xs">{stage.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-3">
        {applications.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center py-12 text-center">
              <Building2 className="text-muted-foreground mb-4 h-12 w-12" />
              <p className="font-medium">No applications yet</p>
              <p className="text-muted-foreground mt-1 text-sm">
                Start tracking your job applications
              </p>
            </CardContent>
          </Card>
        )}

        {applications.map((app) => (
          <Card key={app.id}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                <Building2 className="text-primary h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{app.company}</p>
                  <Badge variant="outline" className="text-xs">
                    {app.role}
                  </Badge>
                </div>
                <div className="text-muted-foreground mt-1 flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" />
                    {new Date(app.applied_date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  {app.notes && (
                    <span className="text-muted-foreground/60">
                      {app.notes}
                    </span>
                  )}
                </div>
              </div>
              <Select
                value={app.stage}
                onValueChange={(v) =>
                  updateStage(
                    app.id,
                    v as (typeof stages)[number]["value"]
                  )
                }
              >
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {stages.map((stage) => (
                    <SelectItem key={stage.value} value={stage.value}>
                      {stage.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteApplication(app.id)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
