"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Route,
  GraduationCap,
  FileText,
  CalendarCheck,
} from "lucide-react"

const bottomItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/roadmap", label: "Roadmap", icon: Route },
  { href: "/resume", label: "Resume", icon: FileText },
  { href: "/interview", label: "Interview", icon: GraduationCap },
  { href: "/applications", label: "Apps", icon: CalendarCheck },
]

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-primary/10 bg-background/90 backdrop-blur-sm md:hidden">
      {bottomItems.map((item) => {
        const isActive = pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-all",
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <item.icon
              className={cn(
                "h-5 w-5",
                isActive && "drop-shadow-[0_0_6px_oklch(0.72_0.18_210/0.5)]"
              )}
            />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
