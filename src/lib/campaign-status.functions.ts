import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware'

const schema = z.object({
  campaign_id: z.string().uuid(),
  note: z.string().trim().max(1000).optional(),
})

/** Emails every donor of a finished campaign its final status. Fundraising managers only. */
export const sendCampaignStatusUpdate = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => schema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: allowed } = await context.supabase.rpc('can_manage', {
      _user_id: context.userId,
      _area: 'fundraising',
    })
    if (!allowed) throw new Error('Forbidden')

    const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
    const { data: campaign, error: campaignError } = await supabaseAdmin
      .from('campaigns')
      .select('id, title, raised_amount, goal_amount')
      .eq('id', data.campaign_id)
      .maybeSingle()
    if (campaignError) throw new Error(campaignError.message)
    if (!campaign) throw new Error('Campaign not found')

    const { data: donations, error: donationsError } = await supabaseAdmin
      .from('donations')
      .select('email, donor_name')
      .eq('campaign_id', data.campaign_id)
      .not('email', 'is', null)
    if (donationsError) throw new Error(donationsError.message)

    const recipients = new Map<string, string | null>()
    for (const row of donations ?? []) {
      const email = row.email?.trim().toLowerCase()
      if (email && !recipients.has(email)) recipients.set(email, row.donor_name)
    }

    const money = (value: number) =>
      new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value)

    const { sendTemplateEmail } = await import('./email-templates/send-email')
    let sent = 0
    for (const [email, donorName] of recipients) {
      try {
        await sendTemplateEmail('campaign-status', email, {
          templateData: {
            donorName: donorName ?? undefined,
            campaignTitle: campaign.title,
            raised: money(Number(campaign.raised_amount ?? 0)),
            goal: campaign.goal_amount ? money(Number(campaign.goal_amount)) : undefined,
            note: data.note,
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

    return { sent, recipients: recipients.size }
  })