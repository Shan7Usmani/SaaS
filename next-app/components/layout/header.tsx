"use client"

import { useAuth } from "@/providers/auth-provider"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, User, Settings } from "lucide-react"
import Link from "next/link"

export function Header() {
  const { user, profile, signOut } = useAuth()

  const initials = profile?.name
    ? profile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() ?? "U"

  return (
    <header className="flex h-14 items-center justify-end gap-4 border-b border-primary/10 bg-background/80 px-6 backdrop-blur-sm">
      <DropdownMenu>
        <DropdownMenuTrigger
            render={
              <Button variant="ghost" className="relative h-8 w-8 rounded-full" />
            }
          >
            <Avatar className="h-8 w-8 ring-1 ring-primary/30">
              <AvatarFallback className="text-xs bg-primary/20 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 border-primary/20">
          <div className="px-2 py-1.5 text-sm font-medium text-foreground">
            {profile?.name ?? user?.email}
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
