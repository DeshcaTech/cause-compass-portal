import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

const applicationSchema = z.object({
  job_id: z.string().uuid(),
  full_name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(30).optional().default(''),
  membership_number: z.string().trim().max(40).optional().default(''),
  message: z.string().trim().max(2000).optional().default(''),
})

export const submitJobApplication = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => applicationSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server')

    const { data: job, error: jobError } = await supabaseAdmin
      .from('jobs')
      .select('id, title, company, contact_email, contact_phone, apply_url, is_published, approval_status')
      .eq('id', data.job_id)
      .single()
    if (jobError || !job || !job.is_published || job.approval_status !== 'approved') {
      throw new Error('This job advert is no longer available')
    }

    const { data: row, error } = await supabaseAdmin
      .from('job_applications')
      .insert({
        job_id: data.job_id,
        full_name: data.full_name,
        email: data.email,
        phone: data.phone || null,
        membership_number: data.membership_number || null,
        message: data.message || null,
      })
      .select('id')
      .single()
    if (error || !row) throw new Error(error?.message ?? 'Could not record your interest')

    if (job.contact_email) {
      try {
        const { sendTemplateEmail } = await import('./email-templates/send-email')
        await sendTemplateEmail('job-application', job.contact_email, {
          templateData: {
            jobTitle: job.title,
            company: job.company,
            applicantName: data.full_name,
            applicantEmail: data.email,
            applicantPhone: data.phone || '',
            membershipNumber: data.membership_number || '',
            message: data.message || '',
          },
          idempotencyKey: `job-application-${row.id}`,
        })
      } catch (err) {
        console.error('Job application notification failed', err)
      }
    }

    return { ok: true, applyUrl: job.apply_url ?? null }
  })
