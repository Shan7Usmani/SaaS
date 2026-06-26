"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

interface GeneratedRoadmap {
  id: string
  user_id: string
  target_company: string
  target_role: string | null
  months: { month: number; title: string; topics: { name: string }[] }[]
  completion_pct: number
  total_topics: number
  created_at: string
}

async function generateRoadmap(data: {
  target_company: string
  target_role?: string
}): Promise<GeneratedRoadmap> {
  const res = await fetch("/api/roadmap/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.error ?? "Failed to generate roadmap")
  }
  const json = await res.json()
  return json.data as GeneratedRoadmap
}

interface MarkTopicResponse {
  id: string
  is_completed: boolean
  roadmap_completion_pct: number
}

async function markTopic(
  roadmapId: string,
  topicId: string,
  isCompleted: boolean
): Promise<MarkTopicResponse> {
  const res = await fetch(`/api/roadmap/${roadmapId}/topic/${topicId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ is_completed: isCompleted }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.error ?? "Failed to update topic")
  }
  const json = await res.json()
  return json.data as MarkTopicResponse
}

export function useGenerateRoadmap() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: generateRoadmap,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roadmap"] })
    },
  })
}

export function useMarkTopic() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      roadmapId,
      topicId,
      isCompleted,
    }: {
      roadmapId: string
      topicId: string
      isCompleted: boolean
    }) => markTopic(roadmapId, topicId, isCompleted),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roadmap"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    },
  })
}
