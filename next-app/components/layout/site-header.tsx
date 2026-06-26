"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ChevronRight, Menu, X } from "lucide-react"
import { useState } from "react"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/features", label: "Features" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
]

export function SiteHeader() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="fixed top-0 z-50 w-full border-b border-primary/10 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-primary flex h-7 w-7 items-center justify-center rounded-full">
            <span className="text-primary-foreground text-xs font-bold">P</span>
          </div>
          <span className="font-bold tracking-tight text-lg">PlacementOS</span>
        </Link>

        <button
          className="flex items-center justify-center md:hidden"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

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

        <div className="hidden items-center gap-3 md:flex">
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

      {mobileOpen && (
        <div className="border-t border-primary/10 bg-background px-4 pb-4 pt-2 md:hidden">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "rounded-md px-3 py-2 text-sm transition-colors",
                  pathname === link.href
                    ? "bg-primary/10 text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {link.label}
              </Link>
            ))}
            <hr className="my-2 border-primary/10" />
            <Link
              href="/auth/login"
              onClick={() => setMobileOpen(false)}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              onClick={() => setMobileOpen(false)}
              className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground text-center"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
