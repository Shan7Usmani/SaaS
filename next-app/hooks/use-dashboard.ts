"use client"

import { useQuery } from "@tanstack/react-query"
import type { DashboardData } from "@/types"

async function fetchDashboard(): Promise<DashboardData> {
  const res = await fetch("/api/dashboard")
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.error ?? `Failed to fetch dashboard data (${res.status})`)
  }
  const json = await res.json()
  return json.data as DashboardData
}

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard,
    staleTime: 30_000,
    retry: 1,
  })
}
