import { createFileRoute } from '@tanstack/react-router'

function siteUrl() {
  return process.env['PUBLIC_SITE_URL'] || 'https://cause-compass-portal.lovable.app'
}

async function runDigest() {
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
  const { signEventReport } = await import('@/lib/report-links.server')
  const { sendTemplateEmail } = await import('@/lib/email-templates/send-email')

  const { data: events, error } = await supabaseAdmin
    .from('events')
    .select('id, title, start_at, location, notify_email, notify_whatsapp')
    .gte('start_at', new Date().toISOString())
    .order('start_at')
  if (error) throw new Error(error.message)

  const today = new Date()
  const since = new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString()
  let sent = 0

  for (const event of events ?? []) {
    const recipient = (event.notify_email ?? '').trim()
    const whatsapp = (event.notify_whatsapp ?? '').replace(/[^0-9]/g, '')
    if (!recipient) continue

    const { data: rsvps } = await supabaseAdmin
      .from('event_rsvps')
      .select('status, guests, created_at')
      .eq('event_id', event.id)

    const rows = rsvps ?? []
    const going = rows.filter((r) => r.status === 'going').length
    const interested = rows.length - going
    const attendees = rows.reduce((sum, r) => sum + 1 + (r.guests ?? 0), 0)
    const newToday = rows.filter((r) => r.created_at >= since).length

    const signature = await signEventReport(event.id)
    const reportUrl = `${siteUrl()}/rsvp-report/${event.id}?k=${signature}`
    try {
      await sendTemplateEmail('rsvp-digest', recipient, {
        templateData: {
          eventTitle: event.title,
          eventDate: new Date(event.start_at).toLocaleString('en-GB', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          eventLocation: event.location ?? '',
          reportUrl,
          going,
          interested,
          attendees,
          newToday,
          whatsappUrl: whatsapp
            ? `https://wa.me/${whatsapp}?text=${encodeURIComponent(
                `RSVP status for ${event.title}: ${going} going, ${interested} interested, ${attendees} expected attendees. Full report: ${reportUrl}`,
              )}`
            : '',
          reportDate: today.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }),
        },
        idempotencyKey: `rsvp-digest-${event.id}-${today.toISOString().slice(0, 10)}`,
      })
      sent += 1
    } catch (err) {
      console.error('RSVP digest failed for event', event.id, err)
    }
  }

  return sent
}

export const Route = createFileRoute('/api/public/hooks/daily-rsvp-digest')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env['RSVP_DIGEST_CRON_KEY'] || process.env['RSVP_DIGEST_SECRET']
        const token = request.headers.get('authorization')?.replace('Bearer ', '') ?? ''
        if (!secret || token !== secret) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          })
        }

        try {
          const sent = await runDigest()
          return new Response(JSON.stringify({ success: true, sent }), {
            headers: { 'Content-Type': 'application/json' },
          })
        } catch (err) {
          console.error('Daily RSVP digest failed', err)
          return new Response(
            JSON.stringify({ success: false, error: (err as Error).message }),
            { status: 500, headers: { 'Content-Type': 'application/json' } },
          )
        }
      },
    },
  },
})