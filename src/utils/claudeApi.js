const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY

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

export async function adaptExamForDyslexia(examText) {
  if (!ANTHROPIC_API_KEY) {
    throw new Error('Missing API key. Please set VITE_ANTHROPIC_API_KEY in your .env file.')
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Please adapt the following exam for dyslexic students:\n\n${examText}`
        }
      ]
    })
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error?.error?.message || `API error: ${response.status}`)
  }

  const data = await response.json()
  return data.content[0].text
}
