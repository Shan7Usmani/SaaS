"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { Application } from "@/types"

async function fetchApplications(): Promise<Application[]> {
  const res = await fetch("/api/applications")
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.error ?? `Failed to fetch applications (${res.status})`)
  }
  const json = await res.json()
  return json.data as Application[]
}

async function createApplication(data: {
  company: string
  role: string
  stage?: string
  notes?: string
  applied_at?: string
}): Promise<Application> {
  const res = await fetch("/api/applications", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.error ?? "Failed to create application")
  }
  const json = await res.json()
  return json.data as Application
}

async function updateApplication(
  id: string,
  data: { stage?: string; company?: string; role?: string; notes?: string | null }
): Promise<Application> {
  const res = await fetch(`/api/applications/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.error ?? "Failed to update application")
  }
  const json = await res.json()
  return json.data as Application
}

async function deleteApplication(id: string): Promise<void> {
  const res = await fetch(`/api/applications/${id}`, { method: "DELETE" })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.error ?? "Failed to delete application")
  }
}

export function useApplications() {
  return useQuery({
    queryKey: ["applications"],
    queryFn: fetchApplications,
    staleTime: 30_000,
    retry: 1,
  })
}

export function useCreateApplication() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] })
    },
  })
}

export function useUpdateApplication() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateApplication>[1] }) =>
      updateApplication(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] })
    },
  })
}

export function useDeleteApplication() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] })
    },
  })
}
