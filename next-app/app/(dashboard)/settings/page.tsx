"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/providers/auth-provider"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  User,
  Bell,
  Shield,
  Palette,
  Save,
  Loader2,
  Moon,
  Sun,
  Monitor,
} from "lucide-react"
import { toast } from "sonner"
import { useTheme } from "next-themes"

export default function SettingsPage() {
  const { profile } = useAuth()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const [profileForm, setProfileForm] = useState({
    name: profile?.name || "",
    email: profile?.email || "",
  })

  const [notifications, setNotifications] = useState({
    emailReminders: true,
    applicationUpdates: true,
    interviewTips: true,
    weeklyDigest: false,
  })

  const handleSaveProfile = async () => {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 1000))
    toast.success("Profile updated successfully")
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account and preferences
        </p>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <div>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                value={profileForm.name}
                onChange={(e) =>
                  setProfileForm((p) => ({ ...p, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={profileForm.email} disabled />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>College</Label>
              <Input value={profile?.college || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>Branch</Label>
              <Input value={profile?.branch || ""} disabled />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSaveProfile} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            <div>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize how PlacementOS looks</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Theme</Label>
            <div className="flex gap-2">
              <Button
                variant={mounted && theme === "light" ? "default" : "outline"}
                className="flex-1 gap-2"
                onClick={() => setTheme("light")}
              >
                <Sun className="h-4 w-4" />
                Light
              </Button>
              <Button
                variant={mounted && theme === "dark" ? "default" : "outline"}
                className="flex-1 gap-2"
                onClick={() => setTheme("dark")}
              >
                <Moon className="h-4 w-4" />
                Dark
              </Button>
              <Button
                variant={mounted && theme === "system" ? "default" : "outline"}
                className="flex-1 gap-2"
                onClick={() => setTheme("system")}
              >
                <Monitor className="h-4 w-4" />
                System
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <div>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Choose what notifications you receive
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            {
              key: "emailReminders" as const,
              label: "Email Reminders",
              desc: "Get reminded about upcoming interviews and deadlines",
            },
            {
              key: "applicationUpdates" as const,
              label: "Application Updates",
              desc: "Notifications when your application status changes",
            },
            {
              key: "interviewTips" as const,
              label: "Interview Tips",
              desc: "Receive tips and resources before your interviews",
            },
            {
              key: "weeklyDigest" as const,
              label: "Weekly Digest",
              desc: "Weekly summary of your progress and activity",
            },
          ].map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-muted-foreground text-xs">{item.desc}</p>
              </div>
              <Switch
                checked={notifications[item.key]}
                onCheckedChange={(checked) =>
                  setNotifications((n) => ({ ...n, [item.key]: checked }))
                }
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 dark:border-red-900">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-500" />
            <div>
              <CardTitle>Danger Zone</CardTitle>
              <CardDescription>
                Irreversible account actions
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-red-200 p-3 dark:border-red-900">
            <div>
              <p className="text-sm font-medium">Reset Progress</p>
              <p className="text-muted-foreground text-xs">
                Clear all your roadmap, interview, and application data
              </p>
            </div>
            <Button variant="outline" size="sm" className="text-red-500 border-red-200 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950">
              Reset
            </Button>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-red-200 p-3 dark:border-red-900">
            <div>
              <p className="text-sm font-medium">Delete Account</p>
              <p className="text-muted-foreground text-xs">
                Permanently delete your account and all associated data
              </p>
            </div>
            <Button variant="outline" size="sm" className="text-red-500 border-red-200 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950">
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
