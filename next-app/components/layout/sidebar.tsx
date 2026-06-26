"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  LayoutDashboard,
  Route,
  Code2,
  GitFork,
  GraduationCap,
  FileText,
  Briefcase,
  CalendarCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/roadmap", label: "Roadmap", icon: Route },
  { href: "/dsa",        label: "DSA Tracker", icon: Code2 },
  { href: "/github",     label: "GitHub",      icon: GitFork },
  { href: "/resume", label: "Resume", icon: FileText },
  { href: "/interview", label: "Interview", icon: GraduationCap },
  { href: "/applications", label: "Applications", icon: CalendarCheck },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/settings", label: "Settings", icon: Settings },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        "border-r border-sidebar-border bg-sidebar hidden flex-col transition-all duration-300 md:flex",
        collapsed ? "w-16" : "w-60"
      )}
    >
      <div
        className={cn(
          "flex h-14 items-center border-b border-sidebar-border",
          collapsed ? "justify-center px-0" : "px-4"
        )}
      >
        {!collapsed && (
          <Link
            href="/dashboard"
            className="font-bold tracking-widest text-lg text-primary"
          >
            PLACEMENTOS
          </Link>
        )}
        {collapsed && (
          <Link
            href="/dashboard"
            className="font-bold text-primary text-sm tracking-widest"
          >
            P
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className={cn("text-muted-foreground hover:text-foreground", collapsed && "mx-auto")}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
      <ScrollArea className="flex-1 py-2">
        <nav className="flex flex-col gap-1 px-2">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 transition-all",
                    collapsed && "justify-center px-2",
                    isActive && "border-l-2 border-primary shadow-[0_0_10px_-3px_oklch(0.72_0.18_210/0.2)]"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-4 w-4 shrink-0",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                  {!collapsed && (
                    <span className={isActive ? "text-foreground" : "text-muted-foreground"}>
                      {item.label}
                    </span>
                  )}
                </Button>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>
    </aside>
  )
}
