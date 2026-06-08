"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Upload, FileText, X, CheckCircle2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface ResumeUploaderProps {
  onFileSelected: (file: File) => void
  isAnalyzing: boolean
  fileName?: string
}

export function ResumeUploader({ onFileSelected, isAnalyzing, fileName }: ResumeUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateFile = useCallback((file: File) => {
    setError(null)
    if (!file.name.endsWith(".pdf") && file.type !== "application/pdf") {
      setError("Only PDF files are accepted")
      return false
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("File size exceeds 5MB limit")
      return false
    }
    return true
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      const f = e.dataTransfer.files?.[0]
      if (f && validateFile(f)) onFileSelected(f)
    },
    [onFileSelected, validateFile]
  )

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0]
      if (f && validateFile(f)) onFileSelected(f)
    },
    [onFileSelected, validateFile]
  )

  if (isAnalyzing) {
    return (
      <div className="border-primary/50 bg-primary/5 flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-16">
        <div className="bg-primary/10 mb-4 rounded-full p-4">
          <FileText className="text-primary h-8 w-8" />
        </div>
        <p className="font-semibold">{fileName}</p>
        <p className="text-muted-foreground text-sm">Analyzing your resume...</p>
      </div>
    )
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-16 transition-all",
        isDragOver
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50 hover:bg-muted/50"
      )}
    >
      {fileName ? (
        <>
          <div className="bg-emerald-100 mb-4 rounded-full p-4 dark:bg-emerald-900">
            <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="font-semibold">{fileName}</p>
          <p className="text-muted-foreground mb-4 text-sm">Ready for analysis</p>
          <div className="flex gap-3">
            <label className="cursor-pointer">
              <Button variant="outline" size="sm">
                <Upload className="mr-2 h-4 w-4" />
                Change File
              </Button>
              <input type="file" accept=".pdf" className="hidden" onChange={handleInput} />
            </label>
          </div>
        </>
      ) : (
        <>
          <div className="bg-primary/10 mb-4 rounded-full p-4">
            <Upload className="text-primary h-8 w-8" />
          </div>
          <p className="mb-1 text-lg font-semibold">Upload your resume</p>
          <p className="text-muted-foreground mb-2 text-sm">Drag & drop or click to browse</p>
          <p className="text-muted-foreground/60 mb-6 text-xs">PDF only, max 5MB</p>
          {error && (
            <div className="mb-4 flex items-center gap-2 text-sm text-red-500">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
          <label className="cursor-pointer">
            <Button>
              <FileText className="mr-2 h-4 w-4" />
              Choose File
            </Button>
            <input type="file" accept=".pdf" className="hidden" onChange={handleInput} />
          </label>
        </>
      )}
    </div>
  )
}
