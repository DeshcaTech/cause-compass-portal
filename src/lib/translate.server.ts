import { createHash } from 'crypto'

export function hashText(text: string) {
  return createHash('sha256').update(text).digest('hex').slice(0, 32)
}

const SYSTEM = `You are a professional translator for a Cameroonian community association website based in Greater Manchester (UK).
Translate each English string into natural French (France).
Rules:
- Keep proper nouns, acronyms (CCGMs, WhatsApp, NHS), names, emails, URLs, and prices unchanged.
- Preserve punctuation, line breaks and any markdown or emoji.
- Do not add explanations. Return only the translation.
- Keep the translation concise so it fits the same UI space where possible.`

/** Translates a batch of strings with the Lovable AI gateway. Returns same-length array. */
export async function translateBatch(texts: string[], lang: string): Promise<string[]> {
  const apiKey = process.env['LOVABLE_API_KEY']
  if (!apiKey || texts.length === 0) return texts

  const payload = texts.map((text, i) => ({ i, text }))
  const res = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: SYSTEM },
        {
          role: 'user',
          content: `Target language: ${lang === 'fr' ? 'French (France)' : lang}.
Translate every item. Reply with JSON only: {"items":[{"i":0,"text":"…"}]}.

${JSON.stringify(payload)}`,
        },
      ],
      response_format: { type: 'json_object' },
    }),
  })
  if (!res.ok) {
    console.error('translate gateway error', res.status, await res.text())
    return texts
  }
  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] }
  const content = json.choices?.[0]?.message?.content
  if (!content) return texts
  try {
    const parsed = JSON.parse(content) as { items?: { i: number; text: string }[] }
    const out = [...texts]
    for (const item of parsed.items ?? []) {
      if (typeof item?.i === 'number' && typeof item.text === 'string' && out[item.i] !== undefined) {
        out[item.i] = item.text
      }
    }
    return out
  } catch {
    return texts
  }
}
