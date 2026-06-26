interface OpenAIResponse {
  choices: {
    message: {
      content: string
    }
  }[]
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

function getOpenAIConfig() {
  return {
    baseUrl: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
    apiKey: process.env.OPENAI_API_KEY,
    defaultModel: process.env.OPENAI_MODEL || "gpt-4o-mini",
  }
}

async function openAIFetch(
  body: Record<string, unknown>
): Promise<OpenAIResponse> {
  const { baseUrl, apiKey } = getOpenAIConfig()

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured")
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`OpenAI-compatible API error (${response.status}): ${errorText}`)
  }

  return response.json()
}

export async function callOpenAI(
  systemPrompt: string,
  userPrompt: string,
  model?: string
) {
  const { defaultModel } = getOpenAIConfig()
  const data = await openAIFetch({
    model: model || defaultModel,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 2048,
  })

  const content = data.choices?.[0]?.message?.content
  if (!content) {
    throw new Error("OpenAI-compatible API returned empty response")
  }

  return content
}

export async function callOpenAIJSON<T>(
  systemPrompt: string,
  userPrompt: string,
  model?: string
): Promise<T> {
  const { defaultModel } = getOpenAIConfig()
  const data = await openAIFetch({
    model: model || defaultModel,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
    max_tokens: 4096,
  })

  const content = data.choices?.[0]?.message?.content
  if (!content) {
    throw new Error("OpenAI-compatible API returned empty response")
  }

  return JSON.parse(content) as T
}
