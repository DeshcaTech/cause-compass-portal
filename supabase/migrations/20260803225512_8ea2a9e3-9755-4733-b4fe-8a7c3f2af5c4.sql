ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'board_manager';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'president_manager';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'fundraising_manager';

CREATE OR REPLACE FUNCTION public.can_manage(_user_id uuid, _area text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND (role::text = 'admin' OR role::text = _area || '_manager')
  );
$$;

REVOKE ALL ON FUNCTION public.can_manage(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_manage(uuid, text) TO authenticated;

DROP POLICY IF EXISTS "Admins manage board members" ON public.board_members;
CREATE POLICY "Board managers manage board members"
ON public.board_members FOR ALL TO authenticated
USING (public.can_manage(auth.uid(), 'board'))
WITH CHECK (public.can_manage(auth.uid(), 'board'));

DROP POLICY IF EXISTS "Admins manage president message" ON public.president_message;
CREATE POLICY "President managers manage president message"
ON public.president_message FOR ALL TO authenticated
USING (public.can_manage(auth.uid(), 'president'))
WITH CHECK (public.can_manage(auth.uid(), 'president'));

DROP POLICY IF EXISTS "admins manage campaigns" ON public.campaigns;
CREATE POLICY "Fundraising managers manage campaigns"
ON public.campaigns FOR ALL TO authenticated
USING (public.can_manage(auth.uid(), 'fundraising'))
WITH CHECK (public.can_manage(auth.uid(), 'fundraising'));