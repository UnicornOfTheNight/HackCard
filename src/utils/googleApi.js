const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY
const GEMINI_MODEL = 'gemini-2.5-flash'

const SYSTEM_PROMPT = `You are an expert educational accessibility specialist. Your task is to adapt exam content for students with dyslexia.

When adapting an exam, follow these strict rules:
1. PRESERVE all questions, their order, and their educational content - never remove or change the meaning of a question
2. Simplify sentence structure: break long sentences into shorter ones (max 15-20 words per sentence)
3. Use simple, clear vocabulary - replace complex words with simpler synonyms when possible
4. Add clear visual spacing: put each question on its own clear section
5. Number and label each question clearly (e.g., "Question 1:", "Question 2:")
6. Replace passive voice with active voice
7. Spell out abbreviations
8. Keep instructions direct and explicit - one instruction per sentence
9. Add brief, clear section headers if the exam has multiple parts
10. Format answer spaces clearly (e.g., "Answer: _______________")
11. DO NOT use Markdown formatting
12. DO NOT use characters like "#", "*", "**", "-", or backticks for headings or emphasis unless they already exist in the original exam content
13. Return plain text only, ready to print as an exam document

Output only the adapted exam text - no commentary, no explanation, no preamble.
Maintain the same language as the original exam (French or English).`

function normalizeGoogleError(message) {
  if (!message) {
    return 'Unknown Google Generative AI error.'
  }

  if (message.includes('API key not valid')) {
    return 'Invalid Google API key. Check VITE_GOOGLE_API_KEY in your .env file.'
  }

  if (message.includes('quota') || message.includes('Quota')) {
    return 'Google Generative AI quota exceeded. Check your API limits and billing.'
  }

  return message
}

function extractGeminiText(data) {
  const parts = data?.candidates?.[0]?.content?.parts

  if (!Array.isArray(parts)) {
    return ''
  }

  return parts
    .map((part) => (typeof part?.text === 'string' ? part.text : ''))
    .join('\n')
    .trim()
}

function sanitizeAdaptedText(text) {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/^\s{0,3}#{1,6}\s*/gm, '')
    .replace(/^\s*[-*]\s+/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export async function adaptExamForDyslexia(examText) {
  if (!GOOGLE_API_KEY) {
    throw new Error('Missing API key. Please set VITE_GOOGLE_API_KEY in your .env file.')
  }

  let response
  try {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GOOGLE_API_KEY,
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: SYSTEM_PROMPT }]
          },
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `Please adapt the following exam for dyslexic students:\n\n${examText}`
                }
              ]
            }
          ]
        })
      }
    )
  } catch (error) {
    throw new Error(error.message || 'Unable to reach the Google Generative AI API.')
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(normalizeGoogleError(error?.error?.message || `API error: ${response.status}`))
  }

  const data = await response.json()
  const adaptedText = sanitizeAdaptedText(extractGeminiText(data))

  if (!adaptedText) {
    throw new Error('Google Generative AI returned an empty response.')
  }

  return adaptedText
}
