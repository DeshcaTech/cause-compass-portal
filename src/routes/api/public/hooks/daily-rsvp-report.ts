import { createFileRoute } from '@tanstack/react-router'
import { createClient } from '@supabase/supabase-js'
import { sendTemplateEmail } from '@/lib/email-templates/send-email'
import type { Database } from '@/integrations/supabase/types'

type RsvpRow = {
  full_name: string
  email: string
  phone: string | null
  membership_number: string | null
  guests: number
  status: string
  note: string | null
  created_at: string
}

function csvCell(value: unknown) {
  const text = value === null || value === undefined ? '' : String(value)
  return `"${text.replace(/"/g, '""')}"`
}

function stamp(value: string) {
  return new Date(value).toLocaleString('en-GB', { timeZone: 'Europe/London' })
}

function buildCsv(rows: RsvpRow[]) {
  const header = [
    'Name',
    'Email',
    'Phone',
    'Membership number',
    'Response',
    'Extra guests',
    'Total attendees',
    'Note',
    'Submitted',
  ]
  return [
    header.map(csvCell).join(','),
    ...rows.map((row) =>
      [
        row.full_name,
        row.email,
        row.phone ?? '',
        row.membership_number ?? '',
        row.status,
        row.guests,
        1 + row.guests,
        row.note ?? '',
        stamp(row.created_at),
      ]
        .map(csvCell)
        .join(','),
    ),
  ].join('\n')
}

async function runReport() {
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
  const db = supabaseAdmin as unknown as ReturnType<typeof createClient<Database>>

  const { data: events, error: eventsError } = await db
    .from('events')
    .select('id, title, start_at, location, notify_email, notify_whatsapp')
    .gte('start_at', new Date().toISOString())
    .order('start_at', { ascending: true })

  if (eventsError) throw new Error(eventsError.message)

  const targets = (events ?? []).filter((event) => Boolean(event.notify_email))
  const results: Array<Record<string, unknown>> = []
  const dayAgo = Date.now() - 24 * 60 * 60 * 1000

  for (const event of targets) {
    const { data: rsvps, error } = await db
      .from('event_rsvps')
      .select('full_name, email, phone, membership_number, guests, status, note, created_at')
      .eq('event_id', event.id)
      .order('created_at', { ascending: false })

    if (error) {
      results.push({ event: event.title, sent: false, error: error.message })
      continue
    }

    const rows = (rsvps ?? []) as RsvpRow[]
    const going = rows.filter((r) => r.status === 'going').length
    const interested = rows.length - going
    const expectedAttendees = rows.reduce((sum, r) => sum + 1 + r.guests, 0)
    const newToday = rows.filter((r) => new Date(r.created_at).getTime() >= dayAgo).length
    const today = new Date().toISOString().slice(0, 10)

    try {
      const outcome = await sendTemplateEmail('rsvp-daily-report', event.notify_email!, {
        idempotencyKey: `rsvp-daily-report-${event.id}-${today}`,
        templateData: {
          eventTitle: event.title,
          eventDate: stamp(event.start_at),
          eventLocation: event.location ?? '',
          reportDate: stamp(new Date().toISOString()),
          totalResponses: rows.length,
          going,
          interested,
          expectedAttendees,
          newToday,
          csv: buildCsv(rows),
        },
      })
      results.push({
        event: event.title,
        recipient: event.notify_email,
        whatsapp: event.notify_whatsapp ?? null,
        responses: rows.length,
        ...outcome,
      })
    } catch (err) {
      results.push({
        event: event.title,
        sent: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      })
    }
  }

  return { processed: results.length, results }
}

export const Route = createFileRoute('/api/public/hooks/daily-rsvp-report')({
  server: {
    handlers: {
      POST: async () => {
        try {
          const summary = await runReport()
          return Response.json({ success: true, ...summary })
        } catch (err) {
          console.error('daily-rsvp-report failed', err)
          return Response.json(
            { success: false, error: err instanceof Error ? err.message : 'Unknown error' },
            { status: 500 },
          )
        }
      },
    },
  },
})
