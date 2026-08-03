import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

const familySchema = z.object({
  full_name: z.string().trim().min(2).max(120),
  relation: z.enum(['partner', 'dependent']),
  birth_month: z.number().int().min(1).max(12),
  birth_year: z.number().int().min(1900).max(new Date().getFullYear()),
  phone: z.string().trim().max(30).optional().default(''),
})

const membershipSchema = z.object({
  full_name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(6).max(30),
  address: z.string().trim().min(5).max(300),
  birth_month: z.number().int().min(1).max(12),
  birth_year: z.number().int().min(1900).max(new Date().getFullYear()),
  membership_type: z.enum(['individual', 'student', 'family']),
  amount: z.number().nonnegative(),
  family: z.array(familySchema).max(12).default([]),
})

export const submitMembership = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => membershipSchema.parse(input))
  .handler(async ({ data }) => {
    const { createPublicServerClient } = await import('./public-supabase.server')
    const supabase = createPublicServerClient()

    const { data: number, error } = await supabase.rpc('submit_membership', {
      _full_name: data.full_name,
      _email: data.email,
      _phone: data.phone,
      _address: data.address,
      _birth_month: data.birth_month,
      _birth_year: data.birth_year,
      _membership_type: data.membership_type,
      _amount: data.amount,
      _family: data.family,
    })
    if (error) throw new Error(error.message)

    const membershipNumber = number as unknown as string

    try {
      const { sendTemplateEmail } = await import('./email-templates/send-email')
      await sendTemplateEmail('membership-confirmation', data.email, {
        templateData: {
          fullName: data.full_name,
          membershipNumber,
          membershipType:
            data.membership_type.charAt(0).toUpperCase() + data.membership_type.slice(1),
          amount: `£${data.amount}`,
        },
        idempotencyKey: `membership-confirmation-${membershipNumber}`,
      })
    } catch (err) {
      console.error('Membership confirmation email failed', err)
    }

    return { membershipNumber }
  })

const volunteerSchema = z.object({
  full_name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(30).optional(),
  membership_number: z.string().trim().max(30).optional(),
  availability: z.string().trim().max(200).optional(),
  message: z.string().trim().max(1000).optional(),
  areas: z.array(z.string().trim().max(80)).min(1).max(20),
})

export const submitVolunteerApplication = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => volunteerSchema.parse(input))
  .handler(async ({ data }) => {
    const { createPublicServerClient } = await import('./public-supabase.server')
    const supabase = createPublicServerClient()

    const { data: row, error } = await supabase
      .from('volunteer_applications')
      .insert({
        full_name: data.full_name,
        email: data.email,
        phone: data.phone || null,
        membership_number: data.membership_number || null,
        availability: data.availability || null,
        message: data.message || null,
        areas: data.areas,
      })
      .select('id')
      .single()
    if (error) throw new Error(error.message)

    try {
      const { sendTemplateEmail } = await import('./email-templates/send-email')
      await sendTemplateEmail('volunteer-confirmation', data.email, {
        templateData: {
          fullName: data.full_name,
          areas: data.areas,
          availability: data.availability,
        },
        idempotencyKey: `volunteer-confirmation-${row?.id ?? data.email}`,
      })
    } catch (err) {
      console.error('Volunteer confirmation email failed', err)
    }

    return { ok: true }
  })