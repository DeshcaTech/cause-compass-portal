import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware'

const schema = z.object({
  section: z.string().trim().min(1).max(120),
  requirement: z.string().trim().min(1).max(200),
  currentLevel: z.string().trim().max(200).optional(),
  reason: z.string().trim().max(1000).optional(),
})

/**
 * Emails the level 1 (super) administrators when an admin asks for access to a
 * section their level cannot open.
 */
export const requestAdminAccess = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data, context }): Promise<{ notified: number }> => {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
    const { sendTemplateEmail } = await import('@/lib/email-templates/send-email')

    const { data: requester } = await supabaseAdmin
      .from('profiles')
      .select('full_name, email')
      .eq('id', context.userId)
      .maybeSingle()

    const requesterEmail = requester?.email ?? (context.claims['email'] as string | undefined) ?? ''

    const { data: superAdmins } = await supabaseAdmin
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin')

    const ids = [...new Set((superAdmins ?? []).map((row) => row.user_id))]
    let recipients: string[] = []

    if (ids.length > 0) {
      const { data: profiles } = await supabaseAdmin
        .from('profiles')
        .select('email')
        .in('id', ids)
      recipients = (profiles ?? [])
        .map((p) => p.email)
        .filter((email): email is string => Boolean(email))
    }

    if (recipients.length === 0) {
      const { data: settings } = await supabaseAdmin
        .from('site_settings')
        .select('contact_email')
        .maybeSingle()
      if (settings?.contact_email) recipients = [settings.contact_email]
    }

    if (recipients.length === 0) {
      throw new Error('No administrator inbox is configured to receive this request')
    }

    const submittedAt = new Date().toISOString()
    const templateData = {
      requesterName: requester?.full_name ?? null,
      requesterEmail,
      currentLevel: data.currentLevel ?? 'No admin role',
      section: data.section,
      requirement: data.requirement,
      reason: data.reason ?? '',
      submittedAt,
    }

    let notified = 0
    for (const recipient of [...new Set(recipients)]) {
      try {
        const result = await sendTemplateEmail('admin-access-request', recipient, {
          templateData,
          idempotencyKey: `access-request-${context.userId}-${data.section}-${submittedAt}-${recipient}`,
          ...(requesterEmail ? { replyTo: requesterEmail } : {}),
        })
        if (result.sent) notified += 1
      } catch (error) {
        console.error('access request email failed', recipient, error)
      }
    }

    if (notified === 0) {
      throw new Error('We could not deliver your request. Please contact a level 1 administrator.')
    }

    return { notified }
  })
