import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

const schema = z.object({
  eventId: z.string().uuid(),
  signature: z.string().min(10).max(64),
})

export const getEventRsvpReport = createServerFn({ method: 'GET' })
  .inputValidator((input: unknown) => schema.parse(input))
  .handler(async ({ data }) => {
    const { verifyEventReport } = await import('./report-links.server')
    const ok = await verifyEventReport(data.eventId, data.signature)
    if (!ok) throw new Error('This report link is not valid')

    const { supabaseAdmin } = await import('@/integrations/supabase/client.server')

    const { data: event, error: eventError } = await supabaseAdmin
      .from('events')
      .select('id, title, start_at, location, event_type, organiser')
      .eq('id', data.eventId)
      .single()
    if (eventError || !event) throw new Error('Event not found')

    const { data: rows, error } = await supabaseAdmin
      .from('event_rsvps')
      .select(
        'id, full_name, email, phone, membership_number, guests, status, note, created_at, updated_at',
      )
      .eq('event_id', data.eventId)
      .order('created_at', { ascending: false })
    if (error) throw new Error(error.message)

    return { event, rsvps: rows ?? [] }
  })