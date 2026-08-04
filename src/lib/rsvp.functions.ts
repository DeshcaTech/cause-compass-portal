import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

const baseSchema = z.object({
  full_name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(30).optional().default(''),
  membership_number: z.string().trim().max(30).optional().default(''),
  guests: z.number().int().min(0).max(20).default(0),
  note: z.string().trim().max(500).optional().default(''),
  status: z.enum(['going', 'interested']),
})

const submitSchema = baseSchema.extend({
  event_id: z.string().uuid(),
  user_id: z.string().uuid().nullable().optional(),
})

const tokenSchema = z.object({ token: z.string().uuid() })

function siteUrl() {
  return process.env['PUBLIC_SITE_URL'] || 'https://cause-compass-portal.lovable.app'
}

function formatEventDate(value: string) {
  return new Date(value).toLocaleString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

async function sendRsvpEmail(rsvp: {
  id: string
  full_name: string
  email: string
  status: string
  guests: number
  edit_token: string
  updated_at?: string | null
}, event: {
  title: string
  start_at: string
  location: string | null
  event_type: string
}) {
  try {
    const { sendTemplateEmail } = await import('./email-templates/send-email')
    await sendTemplateEmail('rsvp-confirmation', rsvp.email, {
      templateData: {
        fullName: rsvp.full_name,
        eventTitle: event.title,
        eventDate: formatEventDate(event.start_at),
        eventLocation: event.location ?? '',
        eventType: event.event_type === 'ccgms' ? 'CCGMs event' : 'Other event',
        status: rsvp.status,
        guests: rsvp.guests,
        editUrl: `${siteUrl()}/rsvp/${rsvp.edit_token}`,
      },
      idempotencyKey: `rsvp-${rsvp.id}-${rsvp.updated_at ?? 'new'}`,
    })
  } catch (err) {
    console.error('RSVP confirmation email failed', err)
  }
}

export const submitEventRsvp = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => submitSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server')

    const { data: event, error: eventError } = await supabaseAdmin
      .from('events')
      .select('id, title, start_at, location, event_type')
      .eq('id', data.event_id)
      .single()
    if (eventError || !event) throw new Error('Event not found')

    const { data: row, error } = await supabaseAdmin
      .from('event_rsvps')
      .insert({
        event_id: data.event_id,
        user_id: data.user_id ?? null,
        full_name: data.full_name,
        email: data.email,
        phone: data.phone || null,
        membership_number: data.membership_number || null,
        guests: data.guests,
        note: data.note || null,
        status: data.status,
      })
      .select('id, full_name, email, status, guests, edit_token')
      .single()
    if (error || !row) throw new Error(error?.message ?? 'Could not save your RSVP')

    await sendRsvpEmail(row, event)

    return { editToken: row.edit_token as string }
  })

export const getRsvpByToken = createServerFn({ method: 'GET' })
  .inputValidator((input: unknown) => tokenSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
    const { data: row, error } = await supabaseAdmin
      .from('event_rsvps')
      .select(
        'id, event_id, full_name, email, phone, membership_number, guests, note, status, events(title, start_at, location, event_type)',
      )
      .eq('edit_token', data.token)
      .maybeSingle()
    if (error) throw new Error(error.message)
    if (!row) return null
    return row
  })

export const updateRsvpByToken = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => baseSchema.extend(tokenSchema.shape).parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
    const { data: row, error } = await supabaseAdmin
      .from('event_rsvps')
      .update({
        full_name: data.full_name,
        email: data.email,
        phone: data.phone || null,
        membership_number: data.membership_number || null,
        guests: data.guests,
        note: data.note || null,
        status: data.status,
      })
      .eq('edit_token', data.token)
      .select('id, full_name, email, status, guests, edit_token, updated_at, event_id')
      .maybeSingle()
    if (error) throw new Error(error.message)
    if (!row) throw new Error('This RSVP link is no longer valid')

    const { data: event } = await supabaseAdmin
      .from('events')
      .select('title, start_at, location, event_type')
      .eq('id', row.event_id)
      .single()
    if (event) await sendRsvpEmail(row, event)

    return { ok: true }
  })

export const cancelRsvpByToken = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => tokenSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
    const { error } = await supabaseAdmin
      .from('event_rsvps')
      .delete()
      .eq('edit_token', data.token)
    if (error) throw new Error(error.message)
    return { ok: true }
  })
