const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions"

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

export async function callOpenAI(
  systemPrompt: string,
  userPrompt: string,
  model = "gpt-4o-mini"
) {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured")
  }

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 2048,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`OpenAI API error (${response.status}): ${errorText}`)
  }

  const data: OpenAIResponse = await response.json()

  const content = data.choices?.[0]?.message?.content
  if (!content) {
    throw new Error("OpenAI returned empty response")
  }

  return content
}

export async function callOpenAIJSON<T>(
  systemPrompt: string,
  userPrompt: string,
  model = "gpt-4o-mini"
): Promise<T> {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured")
  }

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 4096,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`OpenAI API error (${response.status}): ${errorText}`)
  }

  const data: OpenAIResponse = await response.json()
  const content = data.choices?.[0]?.message?.content

  if (!content) {
    throw new Error("OpenAI returned empty response")
  }

  return JSON.parse(content) as T
}
