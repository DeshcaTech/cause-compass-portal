CREATE TABLE public.admin_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  role app_role NOT NULL,
  token_hash text NOT NULL UNIQUE,
  invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  invited_by_email text,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at timestamptz,
  accepted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX admin_invites_email_idx ON public.admin_invites (lower(email));

GRANT SELECT ON public.admin_invites TO authenticated;
GRANT ALL ON public.admin_invites TO service_role;

ALTER TABLE public.admin_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can view invitations"
ON public.admin_invites
FOR SELECT
TO authenticated
USING (public.is_super_admin(auth.uid()));