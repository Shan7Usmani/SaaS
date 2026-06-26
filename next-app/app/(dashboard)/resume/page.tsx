"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { ResumeUploader } from "@/components/features/resume/resume-uploader"
import { ResumeResults } from "@/components/features/resume/resume-results"
import { AiLoadingState, AiErrorState } from "@/components/features/ai/loading-states"

type AnalysisResult = {
  score: number
  ats: number
  keywords: number
  projects: number
  skills: number
  missing: string[]
  suggestions: { priority: "high" | "medium" | "low"; category: string; issue: string; fix: string; impact: string }[]
  weakSections: string[]
}

type PageState = "idle" | "analyzing" | "complete" | "error"

export default function ResumePage() {
  const [pageState, setPageState] = useState<PageState>("idle")
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [analysisStage, setAnalysisStage] = useState(0)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const stageRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stages = [
    "Extracting text from PDF",
    "Scanning for keywords",
    "Calculating ATS score",
    "Generating improvement suggestions",
  ]

  const pollAnalysis = useCallback(async (resumeId: string) => {
    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/resume/${resumeId}`)
        if (!res.ok) return
        const json = await res.json()
        const data = json.data

        if (data.status === "completed") {
          if (pollingRef.current) clearInterval(pollingRef.current)
          setResult({
            score: data.score.overall ?? 0,
            ats: data.score.ats ?? 0,
            keywords: data.score.keywords ?? 0,
            projects: data.score.projects ?? 0,
            skills: data.score.skills ?? 0,
            missing: data.missing_keywords ?? [],
            suggestions: (data.suggestions ?? []).map(
              (s: { category: string; text?: string; issue?: string; fix?: string; impact?: string }) => ({
                priority: "medium" as const,
                category: s.category,
                issue: s.text ?? s.issue ?? "",
                fix: s.fix ?? s.text ?? "",
                impact: s.impact ?? "",
              })
            ),
            weakSections: data.weak_sections ?? [],
          })
          setPageState("complete")
        } else if (data.status === "failed") {
          if (pollingRef.current) clearInterval(pollingRef.current)
          setError("AI analysis failed. Please try again.")
          setPageState("error")
        }
      } catch {
        // poll again
      }
    }, 2000)
  }, [])

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
      if (stageRef.current) clearInterval(stageRef.current)
    }
  }, [])

  const handleFileSelected = useCallback(async (f: File) => {
    setFile(f)
    setError(null)
    setPageState("analyzing")
    setAnalysisStage(0)

    const stageInterval = setInterval(() => {
      setAnalysisStage((prev) => Math.min(prev + 1, stages.length - 1))
    }, 800)
    stageRef.current = stageInterval

    try {
      const formData = new FormData()
      formData.append("file", f)

      const uploadRes = await fetch("/api/resume/upload", {
        method: "POST",
        body: formData,
      })

      if (!uploadRes.ok) {
        throw new Error("Failed to upload resume")
      }

      const { data: uploadData } = await uploadRes.json()
      const resumeId = uploadData.id

      const analyzeRes = await fetch(`/api/resume/${resumeId}/analyze`, {
        method: "POST",
      })

      if (!analyzeRes.ok) {
        throw new Error("AI analysis failed to start")
      }

      pollAnalysis(resumeId)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
      setPageState("error")
    } finally {
      clearInterval(stageInterval)
    }
  }, [pollAnalysis])

  const handleReset = useCallback(() => {
    setPageState("idle")
    setFile(null)
    setResult(null)
    setError(null)
    setAnalysisStage(0)
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resume Analyzer</h1>
          <p className="text-muted-foreground mt-1">
            Upload your resume for AI-powered ATS analysis and improvement suggestions
          </p>
        </div>
        {result && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Resume Score</span>
            <span className="text-2xl font-bold">{result.score}/100</span>
          </div>
        )}
      </div>

      {pageState === "analyzing" && (
        <AiLoadingState phase="Analyzing your resume" stages={stages} currentStage={analysisStage} />
      )}

      {pageState === "idle" && (
        <ResumeUploader
          onFileSelected={handleFileSelected}
          isAnalyzing={false}
          fileName={file?.name}
        />
      )}

      {pageState === "error" && (
        <AiErrorState message={error ?? "Something went wrong"} onRetry={handleReset} />
      )}

      {pageState === "complete" && result && (
        <ResumeResults result={result} onReset={handleReset} />
      )}
    </div>
  )
}
