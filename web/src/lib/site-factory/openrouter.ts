// Minimal OpenRouter chat-completions client for the site factory.

export interface ChatMessage {
  role: 'system' | 'user'
  content: string
}

export async function callOpenRouter(
  messages: ChatMessage[],
  opts: { maxTokens?: number } = {},
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error('OPENROUTER_API_KEY is not set')
  const model = process.env.OPENROUTER_MODEL || 'moonshotai/kimi-k2'

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 240_000) // big builds are fine (founder-approved)
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${apiKey}`,
        'http-referer': 'https://pykk.uk',
        'x-title': 'PYKK site factory',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.4,
        max_tokens: opts.maxTokens ?? 8000,
      }),
      signal: controller.signal,
    })
    if (!response.ok) {
      const text = await response.text().catch(() => '')
      throw new Error(`OpenRouter ${response.status}: ${text.slice(0, 300)}`)
    }
    const data = await response.json()
    const content = data?.choices?.[0]?.message?.content
    if (typeof content !== 'string' || content.length < 500) {
      throw new Error('OpenRouter returned an empty or too-short answer')
    }
    return content
  } finally {
    clearTimeout(timer)
  }
}
