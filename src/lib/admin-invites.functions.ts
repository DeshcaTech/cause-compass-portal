import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { z } from 'zod'

import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware'
import { ADMIN_ROLES, ROLE_LABELS, type AdminRole } from './admin-levels'
import {
  assertSuperAdmin,
  hashToken,
  randomToken,
  statusOf,
  type InviteStatus,
} from './admin-invites.helpers'

export type AdminInvite = {
  id: string
  email: string
  role: AdminRole
  invitedByEmail: string | null
  expiresAt: string
  acceptedAt: string | null
  revokedAt: string | null
  createdAt: string
  status: InviteStatus
}

export const listAdminInvites = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminInvite[]> => {
    await assertSuperAdmin(context.supabase, context.userId)
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
    const { data, error } = await supabaseAdmin
      .from('admin_invites')
      .select('id, email, role, invited_by_email, expires_at, accepted_at, revoked_at, created_at')
      .order('created_at', { ascending: false })
      .limit(100)
    if (error) throw new Error(error.message)
    return (data ?? []).map((row) => ({
      id: row.id,
      email: row.email,
      role: row.role as AdminRole,
      invitedByEmail: row.invited_by_email,
      expiresAt: row.expires_at,
      acceptedAt: row.accepted_at,
      revokedAt: row.revoked_at,
      createdAt: row.created_at,
      status: statusOf(row),
    }))
  })

export const createAdminInvite = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        email: z.string().trim().email().max(255),
        role: z.enum(ADMIN_ROLES),
        expiresInDays: z.number().int().min(1).max(30).default(7),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.supabase, context.userId)
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server')

    const email = data.email.toLowerCase()
    const token = randomToken()
    const tokenHash = await hashToken(token)
    const expiresAt = new Date(Date.now() + data.expiresInDays * 86_400_000).toISOString()

    // Supersede any other open invite for the same address — one live link per person.
    await supabaseAdmin
      .from('admin_invites')
      .update({ revoked_at: new Date().toISOString() })
      .eq('email', email)
      .is('accepted_at', null)
      .is('revoked_at', null)

    const { data: inviter } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('id', context.userId)
      .maybeSingle()

    const { data: invite, error } = await supabaseAdmin
      .from('admin_invites')
      .insert({
        email,
        role: data.role,
        token_hash: tokenHash,
        invited_by: context.userId,
        invited_by_email: inviter?.email ?? null,
        expires_at: expiresAt,
      })
      .select('id')
      .single()
    if (error) throw new Error(error.message)

    const origin = new URL(getRequest().url).origin
    const inviteUrl = `${origin}/admin-invite?token=${token}`

    let emailSent = false
    try {
      const { sendTemplateEmail } = await import('./email-templates/send-email')
      const result = await sendTemplateEmail('admin-invite', email, {
        idempotencyKey: `admin-invite-${invite.id}`,
        templateData: {
          inviteUrl,
          roleLabel: ROLE_LABELS[data.role],
          invitedByEmail: inviter?.email ?? null,
          expiresAt,
        },
      })
      emailSent = result.sent
    } catch (sendError) {
      console.error('admin invite email failed', sendError)
    }

    // The raw token is returned once so the inviter can share the link if email delivery fails.
    return { inviteUrl, emailSent, expiresAt }
  })

export const revokeAdminInvite = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.supabase, context.userId)
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
    const { error } = await supabaseAdmin
      .from('admin_invites')
      .update({ revoked_at: new Date().toISOString() })
      .eq('id', data.id)
      .is('accepted_at', null)
    if (error) throw new Error(error.message)
    return { ok: true }
  })

/** Public: reads an invite by its one-time token so the setup page can show who it is for. */
export const getAdminInvite = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => z.object({ token: z.string().min(20).max(200) }).parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
    const { data: invite } = await supabaseAdmin
      .from('admin_invites')
      .select('email, role, accepted_at, revoked_at, expires_at')
      .eq('token_hash', await hashToken(data.token))
      .maybeSingle()

    if (!invite) return { valid: false as const, reason: 'This invitation link is not valid.' }
    const status = statusOf(invite)
    if (status !== 'pending') {
      return {
        valid: false as const,
        reason:
          status === 'accepted'
            ? 'This invitation has already been used.'
            : status === 'revoked'
              ? 'This invitation was cancelled.'
              : 'This invitation has expired.',
      }
    }
    return {
      valid: true as const,
      email: invite.email,
      roleLabel: ROLE_LABELS[invite.role as AdminRole],
      expiresAt: invite.expires_at,
    }
  })

/** Public: consumes the one-time token, sets up the account and grants the invited level. */
export const acceptAdminInvite = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) =>
    z
      .object({
        token: z.string().min(20).max(200),
        fullName: z.string().trim().min(2).max(120),
        password: z.string().min(8).max(72),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
    const tokenHash = await hashToken(data.token)

    const { data: invite } = await supabaseAdmin
      .from('admin_invites')
      .select('id, email, role, accepted_at, revoked_at, expires_at')
      .eq('token_hash', tokenHash)
      .maybeSingle()
    if (!invite || statusOf(invite) !== 'pending') {
      throw new Error('This invitation link is no longer valid.')
    }

    // Claim the token first so a second submission cannot reuse it.
    const { data: claimed } = await supabaseAdmin
      .from('admin_invites')
      .update({ accepted_at: new Date().toISOString() })
      .eq('id', invite.id)
      .is('accepted_at', null)
      .is('revoked_at', null)
      .select('id')
      .maybeSingle()
    if (!claimed) throw new Error('This invitation link is no longer valid.')

    const { data: existingList } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    })
    const existing = existingList?.users.find(
      (user) => user.email?.toLowerCase() === invite.email.toLowerCase(),
    )

    let userId: string
    if (existing) {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(existing.id, {
        password: data.password,
        email_confirm: true,
        user_metadata: { full_name: data.fullName },
      })
      if (error) throw new Error(error.message)
      userId = existing.id
    } else {
      const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
        email: invite.email,
        password: data.password,
        email_confirm: true,
        user_metadata: { full_name: data.fullName },
      })
      if (error || !created.user) throw new Error(error?.message ?? 'Could not create the account')
      userId = created.user.id
    }

    await supabaseAdmin
      .from('profiles')
      .upsert({ id: userId, email: invite.email, full_name: data.fullName })

    await supabaseAdmin.from('user_roles').delete().eq('user_id', userId).in('role', [...ADMIN_ROLES])
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({ user_id: userId, role: invite.role })
    if (roleError) throw new Error(roleError.message)

    await supabaseAdmin.from('admin_invites').update({ accepted_by: userId }).eq('id', invite.id)

    return { email: invite.email }
  })
