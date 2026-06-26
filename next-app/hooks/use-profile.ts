"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { UserProfile } from "@/types"

async function updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
  const res = await fetch("/api/user/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.error ?? "Failed to update profile")
  }
  const json = await res.json()
  return json.data as UserProfile
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    },
  })
}
