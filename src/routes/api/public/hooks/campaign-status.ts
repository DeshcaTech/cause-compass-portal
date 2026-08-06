import { createFileRoute } from '@tanstack/react-router'

/**
 * Closes campaigns whose end date has passed and emails every donor the final
 * status exactly once (guarded by campaigns.status_notified_at).
 */
async function runCampaignStatus() {
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
  const { sendTemplateEmail } = await import('@/lib/email-templates/send-email')

  const today = new Date().toISOString().slice(0, 10)
  await supabaseAdmin
    .from('campaigns')
    .update({ status: 'past' })
    .eq('status', 'active')
    .not('ends_at', 'is', null)
    .lt('ends_at', today)

  const { data: campaigns, error } = await supabaseAdmin
    .from('campaigns')
    .select('id, title, raised_amount, goal_amount')
    .eq('status', 'past')
    .is('status_notified_at', null)
  if (error) throw new Error(error.message)

  const money = (value: number) =>
    new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value)

  let sent = 0
  for (const campaign of campaigns ?? []) {
    const { data: donations } = await supabaseAdmin
      .from('donations')
      .select('email, donor_name')
      .eq('campaign_id', campaign.id)
      .not('email', 'is', null)

    const recipients = new Map<string, string | null>()
    for (const row of donations ?? []) {
      const email = row.email?.trim().toLowerCase()
      if (email && !recipients.has(email)) recipients.set(email, row.donor_name)
    }

    for (const [email, donorName] of recipients) {
      try {
        await sendTemplateEmail('campaign-status', email, {
          templateData: {
            donorName: donorName ?? undefined,
            campaignTitle: campaign.title,
            raised: money(Number(campaign.raised_amount ?? 0)),
            goal: campaign.goal_amount ? money(Number(campaign.goal_amount)) : undefined,
          },
          idempotencyKey: `campaign-status-${campaign.id}-${email}`,
        })
        sent += 1
      } catch (err) {
        console.error('Campaign status email failed', email, err)
      }
    }

    await supabaseAdmin
      .from('campaigns')
      .update({ status_notified_at: new Date().toISOString() })
      .eq('id', campaign.id)
  }

  return sent
}

export const Route = createFileRoute('/api/public/hooks/campaign-status')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret =
          process.env['CAMPAIGN_STATUS_CRON_KEY'] || process.env['RSVP_DIGEST_CRON_KEY']
        const token = request.headers.get('authorization')?.replace('Bearer ', '') ?? ''
        if (!secret || token !== secret) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          })
        }
        try {
          const sent = await runCampaignStatus()
          return new Response(JSON.stringify({ success: true, sent }), {
            headers: { 'Content-Type': 'application/json' },
          })
        } catch (err) {
          console.error('Campaign status run failed', err)
          return new Response(JSON.stringify({ success: false, error: (err as Error).message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          })
        }
      },
    },
  },
})
