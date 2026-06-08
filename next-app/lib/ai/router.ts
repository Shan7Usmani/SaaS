import { callGemini } from "./gemini"
import { callOpenAI } from "./openai"

export type AITask = "roadmap" | "resume" | "interview" | "dsa" | "code-review"

const providerMap: Record<
  AITask,
  { primary: "gemini" | "openai"; fallback?: "gemini" | "openai"; model?: string }
> = {
  roadmap: { primary: "gemini", fallback: "openai" },
  resume: { primary: "gemini", fallback: "openai" },
  interview: { primary: "openai", fallback: "gemini", model: "gpt-4o-mini" },
  dsa: { primary: "gemini", fallback: "openai" },
  "code-review": { primary: "gemini", fallback: "openai" },
}

export async function callAI(
  task: AITask,
  prompt: string,
  systemInstruction?: string
): Promise<string> {
  const config = providerMap[task]

  try {
    if (config.primary === "gemini") {
      return await callGemini(prompt, systemInstruction)
    }
    return await callOpenAI(systemInstruction || "", prompt, config.model)
  } catch (primaryError) {
    if (!config.fallback) throw primaryError

    console.warn(
      `[AI Router] ${config.primary} failed for ${task}, falling back to ${config.fallback}`,
      primaryError
    )

    if (config.fallback === "gemini") {
      return await callGemini(prompt, systemInstruction)
    }
    return await callOpenAI(systemInstruction || "", prompt, config.model)
  }
}
