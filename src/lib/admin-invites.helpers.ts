import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '@/integrations/supabase/types'

export type InviteStatus = 'pending' | 'accepted' | 'revoked' | 'expired'

export async function hashToken(token: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token))
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function randomToken() {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function assertSuperAdmin(supabase: SupabaseClient<Database>, userId: string) {
  const { data, error } = await supabase.rpc('is_super_admin', { _user_id: userId })
  if (error) throw new Error(error.message)
  if (!data) throw new Error('Only a level 1 administrator can invite administrators')
}

/**
 * Level 1 manages every admin account; level 2 manages level 3 accounts only.
 * Returns the caller's admin level so callers can scope what they touch.
 */
export async function assertAdminManager(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<1 | 2> {
  const { data, error } = await supabase.rpc('admin_level', { _user_id: userId })
  if (error) throw new Error(error.message)
  if (data === 1) return 1
  if (data === 2) return 2
  throw new Error('Only level 1 and level 2 administrators can manage admin accounts')
}

export function assertCanTargetRole(level: 1 | 2, role: string) {
  if (level === 1) return
  if (role !== 'admin_l3') {
    throw new Error('Level 2 administrators can only create or manage level 3 accounts')
  }
}

export function statusOf(row: {
  accepted_at: string | null
  revoked_at: string | null
  expires_at: string
}): InviteStatus {
  if (row.accepted_at) return 'accepted'
  if (row.revoked_at) return 'revoked'
  if (new Date(row.expires_at).getTime() < Date.now()) return 'expired'
  return 'pending'
}
