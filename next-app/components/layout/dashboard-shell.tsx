"use client"

import { useState } from "react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { MobileNav } from "./mobile-nav"
import { MobileBottomNav } from "./mobile-bottom-nav"

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const isMobile = useMediaQuery("(max-width: 767px)")

  if (isMobile) {
    return (
      <div className="flex h-screen flex-col overflow-hidden">
        <MobileNav />
        <main className="flex-1 overflow-y-auto p-4 pb-20">{children}</main>
        <MobileBottomNav />
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
