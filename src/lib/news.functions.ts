import { createServerFn } from '@tanstack/react-start'
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware'
import { z } from 'zod'

const subscribeSchema = z.object({
  email: z.string().trim().email().max(255),
  full_name: z.string().trim().max(120).optional(),
  membership_number: z.string().trim().max(30).optional(),
})

const SITE_URL = 'https://cause-compass-portal.lovable.app'

function baseUrl() {
  return process.env['PUBLIC_SITE_URL'] || SITE_URL
}

export const subscribeToNews = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => subscribeSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
    const { data: row, error } = await supabaseAdmin
      .from('news_subscribers')
      .upsert(
      {
        email: data.email.toLowerCase(),
        full_name: data.full_name || null,
        membership_number: data.membership_number || null,
        is_active: true,
        unsubscribed_at: null,
      },
      { onConflict: 'email' },
      )
      .select('email, full_name, unsubscribe_token')
      .maybeSingle()
    if (error) throw new Error(error.message)

    if (row) {
      try {
        const { sendTemplateEmail } = await import('./email-templates/send-email')
        await sendTemplateEmail('news-subscribed', row.email, {
          templateData: {
            recipientName: row.full_name ?? undefined,
            newsUrl: `${baseUrl()}/news`,
            unsubscribeUrl: `${baseUrl()}/news/unsubscribe?token=${row.unsubscribe_token}`,
          },
          idempotencyKey: `news-sub-${row.unsubscribe_token}`,
        })
      } catch (err) {
        console.error('Subscribe confirmation email failed', err)
      }
    }
    return { ok: true }
  })

const unsubscribeSchema = z.object({ email: z.string().trim().email().max(255) })

export const unsubscribeFromNews = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => unsubscribeSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
    const { data: row, error } = await supabaseAdmin
      .from('news_subscribers')
      .update({ is_active: false, unsubscribed_at: new Date().toISOString() })
      .eq('email', data.email.toLowerCase())
      .select('email, full_name, unsubscribe_token')
      .maybeSingle()
    if (error) throw new Error(error.message)
    if (row) await sendUnsubscribeConfirmation(row)
    return { ok: true }
  })

async function sendUnsubscribeConfirmation(row: {
  email: string
  full_name: string | null
  unsubscribe_token: string
}) {
  try {
    const { sendTemplateEmail } = await import('./email-templates/send-email')
    await sendTemplateEmail('news-unsubscribed', row.email, {
      templateData: {
        recipientName: row.full_name ?? undefined,
        resubscribeUrl: `${baseUrl()}/news/unsubscribe?token=${row.unsubscribe_token}&action=resubscribe`,
      },
      idempotencyKey: `news-unsub-${row.unsubscribe_token}-${Date.now()}`,
    })
  } catch (err) {
    console.error('Unsubscribe confirmation email failed', err)
  }
}

export const unsubscribeByToken = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => z.object({ token: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
    const { data: row, error } = await supabaseAdmin
      .from('news_subscribers')
      .update({ is_active: false, unsubscribed_at: new Date().toISOString() })
      .eq('unsubscribe_token', data.token)
      .select('email, full_name, unsubscribe_token')
      .maybeSingle()
    if (error) throw new Error(error.message)
    if (!row) return { ok: false as const, email: null }
    await sendUnsubscribeConfirmation(row)
    return { ok: true as const, email: row.email as string }
  })

export const resubscribeByToken = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => z.object({ token: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
    const { data: row, error } = await supabaseAdmin
      .from('news_subscribers')
      .update({ is_active: true, unsubscribed_at: null })
      .eq('unsubscribe_token', data.token)
      .select('email, full_name, unsubscribe_token')
      .maybeSingle()
    if (error) throw new Error(error.message)
    if (!row) return { ok: false as const, email: null }
    try {
      const { sendTemplateEmail } = await import('./email-templates/send-email')
      await sendTemplateEmail('news-subscribed', row.email, {
        templateData: {
          recipientName: row.full_name ?? undefined,
          newsUrl: `${baseUrl()}/news`,
          unsubscribeUrl: `${baseUrl()}/news/unsubscribe?token=${row.unsubscribe_token}`,
        },
        idempotencyKey: `news-resub-${row.unsubscribe_token}-${Date.now()}`,
      })
    } catch (err) {
      console.error('Resubscribe confirmation email failed', err)
    }
    return { ok: true as const, email: row.email as string }
  })

export const listNewsSubscribers = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc('has_role', {
      _user_id: context.userId,
      _role: 'admin',
    })
    if (!isAdmin) throw new Error('Forbidden')
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
    const { data, error } = await supabaseAdmin
      .from('news_subscribers')
      .select('id, email, full_name, membership_number, is_active, created_at, unsubscribed_at')
      .order('created_at', { ascending: false })
    if (error) throw new Error(error.message)
    return data ?? []
  })

export const notifySubscribers = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc('has_role', {
      _user_id: context.userId,
      _role: 'admin',
    })
    if (!isAdmin) throw new Error('Forbidden')

    const { supabaseAdmin } = await import('@/integrations/supabase/client.server')

    const { data: item, error: itemError } = await supabaseAdmin
      .from('announcements')
      .select('id, title, summary, body, image_url, published_at, is_published')
      .eq('id', data.id)
      .maybeSingle()
    if (itemError) throw new Error(itemError.message)
    if (!item) throw new Error('News item not found')
    if (!item.is_published) throw new Error('Publish the news item before notifying subscribers')

    const { data: subscribers, error: subError } = await supabaseAdmin
      .from('news_subscribers')
      .select('email, full_name, unsubscribe_token')
      .eq('is_active', true)
    if (subError) throw new Error(subError.message)

    const { sendTemplateEmail } = await import('./email-templates/send-email')
    const baseUrl = process.env['PUBLIC_SITE_URL'] || 'https://cause-compass-portal.lovable.app'
    const publishedAt = new Date(item.published_at).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })

    let sent = 0
    let skipped = 0
    for (const sub of subscribers ?? []) {
      try {
        const result = await sendTemplateEmail('news-announcement', sub.email, {
          templateData: {
            recipientName: sub.full_name ?? undefined,
            title: item.title,
            summary: item.summary ?? undefined,
            body: item.body ?? undefined,
            imageUrl: item.image_url ?? undefined,
            url: `${baseUrl}/news/${item.id}`,
            publishedAt,
            unsubscribeUrl: `${baseUrl}/news/unsubscribe?token=${sub.unsubscribe_token}`,
          },
          idempotencyKey: `news-${item.id}-${sub.email}`,
        })
        if (result.sent) sent += 1
        else skipped += 1
      } catch (err) {
        skipped += 1
        console.error('News notification failed for', sub.email, err)
      }
    }

    await supabaseAdmin
      .from('announcements')
      .update({ notified_at: new Date().toISOString() })
      .eq('id', item.id)

    return { sent, skipped, total: (subscribers ?? []).length }
  })
