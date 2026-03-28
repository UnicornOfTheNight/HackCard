const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY
const REQUEST_TIMEOUT_MS = 45000

const SYSTEM_PROMPT = `You are an expert educational accessibility specialist. Your task is to adapt exam content for students with dyslexia.

When adapting an exam, follow these strict rules:
1. PRESERVE all questions, their order, and their educational content — never remove or change the meaning of a question
2. Simplify sentence structure: break long sentences into shorter ones (max 15-20 words per sentence)
3. Use simple, clear vocabulary — replace complex words with simpler synonyms when possible
4. Add clear visual spacing: put each question on its own clear section
5. Number and label each question clearly (e.g., "Question 1:", "Question 2:")
6. Replace passive voice with active voice
7. Spell out abbreviations
8. Keep instructions direct and explicit — one instruction per sentence
9. Add brief, clear section headers if the exam has multiple parts
10. Format answer spaces clearly (e.g., "Answer: _______________")

Output only the adapted exam text — no commentary, no explanation, no preamble.
Maintain the same language as the original exam (French or English).`

function normalizeOpenRouterError(message) {
  if (!message) {
    return 'Unknown OpenRouter error.'
  }

  if (message.includes('No endpoints available matching your guardrail restrictions and data policy')) {
    return 'OpenRouter blocked this model because your privacy settings are too strict. Open https://openrouter.ai/settings/privacy and relax the data policy for this model, or switch to a different model/provider.'
  }

  return message
}

function extractMessageText(content) {
  if (typeof content === 'string') {
    return content.trim()
  }

  if (Array.isArray(content)) {
    return content
      .map((item) => {
        if (typeof item === 'string') {
          return item
        }

        if (item?.type === 'text' && typeof item.text === 'string') {
          return item.text
        }

        if (typeof item?.content === 'string') {
          return item.content
        }

        return ''
      })
      .join('\n')
      .trim()
  }

  if (content && typeof content === 'object') {
    if (typeof content.text === 'string') {
      return content.text.trim()
    }

    if (typeof content.content === 'string') {
      return content.content.trim()
    }
  }

  return ''
}

export async function adaptExamForDyslexia(examText) {
  if (!OPENROUTER_API_KEY) {
    throw new Error('Missing API key. Please set VITE_OPENROUTER_API_KEY in your .env file.')
  }

  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  let response
  try {
    response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        max_tokens: 4096,
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: `Please adapt the following exam for dyslexic students:\n\n${examText}`
          }
        ]
      }),
      signal: controller.signal
    })
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timed out after 45 seconds. Check your API key, network access, or move the request to a backend server.')
    }

    throw new Error(error.message || 'Unable to reach the OpenRouter API.')
  } finally {
    window.clearTimeout(timeoutId)
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(normalizeOpenRouterError(error?.error?.message || `API error: ${response.status}`))
  }

  const data = await response.json()
  const choice = data?.choices?.[0]
  const adaptedText = extractMessageText(choice?.message?.content)

  if (!adaptedText) {
    const finishReason = choice?.finish_reason ? ` Finish reason: ${choice.finish_reason}.` : ''
    throw new Error(`OpenRouter returned an empty response.${finishReason}`)
  }

  return adaptedText
}
