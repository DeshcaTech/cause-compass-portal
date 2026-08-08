import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware'
import { assertAdminManager, assertCanTargetRole } from './admin-invites.helpers'

const ADMIN_ROLES = ['admin', 'admin_l2', 'admin_l3'] as const
type AdminRole = (typeof ADMIN_ROLES)[number]

export type AdminAccount = {
  userId: string
  email: string
  fullName: string | null
  role: AdminRole
}

/** Level 2 may only touch accounts that are currently level 3. */
async function assertTargetIsManageable(level: 1 | 2, targetUserId: string) {
  if (level === 1) return
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
  const { data } = await supabaseAdmin
    .from('user_roles')
    .select('role')
    .eq('user_id', targetUserId)
    .in('role', [...ADMIN_ROLES])
  const roles = (data ?? []).map((r) => r.role as string)
  if (roles.length > 0 && roles.some((r) => r !== 'admin_l3')) {
    throw new Error('Level 2 administrators can only manage level 3 accounts')
  }
}

export const listAdminAccounts = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminAccount[]> => {
    const level = await assertAdminManager(context.supabase, context.userId)
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server')

    const visibleRoles: AdminRole[] = level === 1 ? [...ADMIN_ROLES] : ['admin_l3']
    const { data: roles, error } = await supabaseAdmin
      .from('user_roles')
      .select('user_id, role')
      .in('role', visibleRoles)
    if (error) throw new Error(error.message)

    const ids = [...new Set((roles ?? []).map((r) => r.user_id))]
    if (ids.length === 0) return []

    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, email')
      .in('id', ids)
    const byId = new Map((profiles ?? []).map((p) => [p.id, p]))

    return (roles ?? []).map((row) => {
      const profile = byId.get(row.user_id)
      return {
        userId: row.user_id,
        email: profile?.email ?? '—',
        fullName: profile?.full_name ?? null,
        role: row.role as AdminRole,
      }
    })
  })

const createSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(72),
  fullName: z.string().trim().min(2).max(120),
  role: z.enum(ADMIN_ROLES),
})

export const createAdminAccount = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => createSchema.parse(input))
  .handler(async ({ data, context }) => {
    const level = await assertAdminManager(context.supabase, context.userId)
    assertCanTargetRole(level, data.role)
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server')

    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.fullName },
    })
    if (error || !created.user) throw new Error(error?.message ?? 'Could not create the account')

    await supabaseAdmin
      .from('profiles')
      .upsert({ id: created.user.id, email: data.email, full_name: data.fullName })

    await supabaseAdmin
      .from('user_roles')
      .delete()
      .eq('user_id', created.user.id)
      .in('role', [...ADMIN_ROLES])

    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({ user_id: created.user.id, role: data.role })
    if (roleError) throw new Error(roleError.message)

    return { userId: created.user.id }
  })

const roleSchema = z.object({ userId: z.string().uuid(), role: z.enum(ADMIN_ROLES) })

export const setAdminLevel = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => roleSchema.parse(input))
  .handler(async ({ data, context }) => {
    const level = await assertAdminManager(context.supabase, context.userId)
    assertCanTargetRole(level, data.role)
    if (data.userId === context.userId) throw new Error('You cannot change your own admin level')
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
    await assertTargetIsManageable(level, data.userId)

    await supabaseAdmin
      .from('user_roles')
      .delete()
      .eq('user_id', data.userId)
      .in('role', [...ADMIN_ROLES])
    const { error } = await supabaseAdmin
      .from('user_roles')
      .insert({ user_id: data.userId, role: data.role })
    if (error) throw new Error(error.message)
    return { ok: true }
  })

export const revokeAdminAccess = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ userId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const level = await assertAdminManager(context.supabase, context.userId)
    if (data.userId === context.userId) throw new Error('You cannot remove your own admin access')
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
    await assertTargetIsManageable(level, data.userId)
    const { error } = await supabaseAdmin
      .from('user_roles')
      .delete()
      .eq('user_id', data.userId)
      .in('role', [...ADMIN_ROLES])
    if (error) throw new Error(error.message)
    return { ok: true }
  })
