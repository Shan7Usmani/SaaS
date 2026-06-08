const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"

interface GeminiResponse {
  candidates: {
    content: {
      parts: { text: string }[]
    }
    finishReason: string
  }[]
}

export async function callGemini(prompt: string, systemInstruction?: string) {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured")
  }

  const contents: Record<string, unknown>[] = []
  if (systemInstruction) {
    contents.push({
      role: "user",
      parts: [{ text: systemInstruction }],
    })
  }
  contents.push({
    role: "user",
    parts: [{ text: prompt }],
  })

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4096,
      },
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Gemini API error (${response.status}): ${errorText}`)
  }

  const data: GeminiResponse = await response.json()

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) {
    throw new Error("Gemini returned empty response")
  }

  return text
}
