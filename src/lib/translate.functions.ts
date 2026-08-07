import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

const schema = z.object({
  lang: z.enum(['fr']),
  texts: z.array(z.string().trim().min(1).max(4000)).min(1).max(60),
})

/** Translates dynamic (admin-authored) content, caching every result in the database. */
export const translateContent = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => schema.parse(input))
  .handler(async ({ data }): Promise<Record<string, string>> => {
    const { hashText, translateBatch } = await import('./translate.server')
    const { createPublicServerClient } = await import('./public-supabase.server')

    const unique = Array.from(new Set(data.texts))
    const hashes = unique.map(hashText)
    const result: Record<string, string> = {}

    const supabase = createPublicServerClient()
    const { data: cached } = await supabase
      .from('content_translations')
      .select('source_hash, source_text, translated_text')
      .eq('lang', data.lang)
      .in('source_hash', hashes)

    const cachedByHash = new Map((cached ?? []).map((r) => [r.source_hash, r.translated_text]))
    const missing: string[] = []
    unique.forEach((text, i) => {
      const hit = cachedByHash.get(hashes[i]!)
      if (hit) result[text] = hit
      else missing.push(text)
    })

    if (missing.length > 0) {
      const translated = await translateBatch(missing, data.lang)
      const rows = missing.map((text, i) => ({
        lang: data.lang,
        source_hash: hashText(text),
        source_text: text,
        translated_text: translated[i] ?? text,
      }))
      for (const row of rows) result[row.source_text] = row.translated_text
      const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
      await supabaseAdmin
        .from('content_translations')
        .upsert(rows, { onConflict: 'lang,source_hash', ignoreDuplicates: true })
    }

    return result
  })
