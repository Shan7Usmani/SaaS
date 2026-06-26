"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ChevronRight } from "lucide-react"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/features", label: "Features" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
]

export function SiteHeader() {
  const pathname = usePathname()

  return (
    <header className="fixed top-0 z-50 w-full border-b border-primary/10 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-primary flex h-7 w-7 items-center justify-center rounded-full">
            <span className="text-primary-foreground text-xs font-bold">P</span>
          </div>
          <span className="font-bold tracking-tight text-lg">PlacementOS</span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm transition-colors",
                pathname === link.href
                  ? "text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
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
  )
}
