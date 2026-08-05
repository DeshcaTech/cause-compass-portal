import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import type { SupabaseClient } from '@supabase/supabase-js'

import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware'
import type { Database } from '@/integrations/supabase/types'

const ADMIN_ROLES = ['admin', 'admin_l2', 'admin_l3'] as const
type AdminRole = (typeof ADMIN_ROLES)[number]

export type AdminAccount = {
  userId: string
  email: string
  fullName: string | null
  role: AdminRole
}

async function assertSuperAdmin(supabase: SupabaseClient<Database>, userId: string) {
  const { data, error } = await supabase.rpc('is_super_admin', { _user_id: userId })
  if (error) throw new Error(error.message)
  if (!data) throw new Error('Only a level 1 administrator can manage admin accounts')
}

export const listAdminAccounts = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminAccount[]> => {
    await assertSuperAdmin(context.supabase, context.userId)
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server')

    const { data: roles, error } = await supabaseAdmin
      .from('user_roles')
      .select('user_id, role')
      .in('role', [...ADMIN_ROLES])
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
    await assertSuperAdmin(context.supabase, context.userId)
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
    await assertSuperAdmin(context.supabase, context.userId)
    if (data.userId === context.userId) throw new Error('You cannot change your own admin level')
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server')

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
    await assertSuperAdmin(context.supabase, context.userId)
    if (data.userId === context.userId) throw new Error('You cannot remove your own admin access')
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
    const { error } = await supabaseAdmin
      .from('user_roles')
      .delete()
      .eq('user_id', data.userId)
      .in('role', [...ADMIN_ROLES])
    if (error) throw new Error(error.message)
    return { ok: true }
  })
