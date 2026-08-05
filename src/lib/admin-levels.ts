export const ADMIN_ROLES = ['admin', 'admin_l2', 'admin_l3'] as const
export type AdminRole = (typeof ADMIN_ROLES)[number]

export const ROLE_LABELS: Record<AdminRole, string> = {
  admin: 'Level 1 — full admin + account management',
  admin_l2: 'Level 2 — full admin, no account management',
  admin_l3: 'Level 3 — site content only',
}
