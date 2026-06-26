"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/providers/auth-provider"
import {
  LayoutDashboard,
  Route,
  Code2,
  GitFork,
  GraduationCap,
  FileText,
  Briefcase,
  CalendarCheck,
  LogOut,
  Menu,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/roadmap", label: "Roadmap", icon: Route },
  { href: "/dsa", label: "DSA Tracker", icon: Code2 },
  { href: "/github", label: "GitHub", icon: GitFork },
  { href: "/resume", label: "Resume", icon: FileText },
  { href: "/interview", label: "Interview", icon: GraduationCap },
  { href: "/applications", label: "Applications", icon: CalendarCheck },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/settings", label: "Settings", icon: Settings },
]

export function MobileNav() {
  const pathname = usePathname()
  const { user, profile, signOut } = useAuth()

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() ?? "U"

  return (
    <header className="flex h-14 items-center justify-between border-b border-primary/10 bg-background/80 px-4 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <Sheet>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            }
          />
          <SheetContent side="left" className="w-64 border-primary/20 bg-background p-0">
            <div className="flex h-14 items-center border-b border-primary/10 px-4">
              <Link href="/dashboard" className="font-bold tracking-widest text-primary text-lg">
                PLACEMENTOS
              </Link>
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
                          "w-full justify-start gap-3",
                          isActive && "border-l-2 border-primary shadow-[0_0_10px_-3px_oklch(0.72_0.18_210/0.2)]"
                        )}
                      >
                        <item.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
                        <span className={isActive ? "text-foreground" : "text-muted-foreground"}>{item.label}</span>
                      </Button>
                    </Link>
                  )
                })}
              </nav>
            </ScrollArea>
          </SheetContent>
        </Sheet>
        <span className="font-bold tracking-widest text-primary">PLACEMENTOS</span>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" className="relative h-8 w-8 rounded-full" />
          }
        >
          <Avatar className="h-8 w-8 ring-1 ring-primary/30">
            <AvatarFallback className="text-xs bg-primary/20 text-primary">{initials}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 border-primary/20">
          <div className="px-2 py-1.5 text-sm font-medium text-foreground">
            {profile?.full_name ?? user?.email}
          </div>
          <DropdownMenuSeparator />
          <Link href="/settings">
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
          </Link>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOut()}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
