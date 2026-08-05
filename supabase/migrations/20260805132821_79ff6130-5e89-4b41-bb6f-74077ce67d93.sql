-- New admin levels (level 1 stays the existing 'admin' role)
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'admin_l2';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'admin_l3';

CREATE OR REPLACE FUNCTION public.admin_level(_user_id uuid)
RETURNS integer LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT min(CASE r.role::text
    WHEN 'admin' THEN 1
    WHEN 'admin_l2' THEN 2
    WHEN 'admin_l3' THEN 3
  END)
  FROM public.user_roles r
  WHERE r.user_id = _user_id;
$$;

-- Full admin (levels 1 and 2)
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT coalesce(public.admin_level(_user_id), 99) <= 2;
$$;

-- Content admin (levels 1, 2 and 3)
CREATE OR REPLACE FUNCTION public.can_edit_content(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT coalesce(public.admin_level(_user_id), 99) <= 3;
$$;

-- Level 1 only
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT coalesce(public.admin_level(_user_id), 99) = 1;
$$;

CREATE OR REPLACE FUNCTION public.can_manage(_user_id uuid, _area text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_admin(_user_id)
     OR (_area IN ('board','event') AND public.can_edit_content(_user_id))
     OR EXISTS (
       SELECT 1 FROM public.user_roles
       WHERE user_id = _user_id AND role::text = _area || '_manager'
     );
$$;

REVOKE ALL ON FUNCTION public.admin_level(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.can_edit_content(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_super_admin(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.can_manage(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_level(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.can_edit_content(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_super_admin(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.can_manage(uuid, text) TO authenticated, service_role;

-- ---------- Content tables: levels 1, 2, 3 ----------
DROP POLICY IF EXISTS "Admins manage announcements" ON public.announcements;
CREATE POLICY "Admins manage announcements" ON public.announcements FOR ALL TO authenticated
  USING (public.can_edit_content(auth.uid())) WITH CHECK (public.can_edit_content(auth.uid()));
DROP POLICY IF EXISTS "Members and admins can read announcements" ON public.announcements;
CREATE POLICY "Members and admins can read announcements" ON public.announcements FOR SELECT
  USING (is_published = true OR public.can_edit_content(auth.uid()));

DROP POLICY IF EXISTS "admins manage events" ON public.events;
CREATE POLICY "admins manage events" ON public.events FOR ALL TO authenticated
  USING (public.can_edit_content(auth.uid())) WITH CHECK (public.can_edit_content(auth.uid()));

DROP POLICY IF EXISTS "admins manage galleries" ON public.galleries;
CREATE POLICY "admins manage galleries" ON public.galleries FOR ALL TO authenticated
  USING (public.can_edit_content(auth.uid())) WITH CHECK (public.can_edit_content(auth.uid()));

DROP POLICY IF EXISTS "admins manage gallery photos" ON public.gallery_photos;
CREATE POLICY "admins manage gallery photos" ON public.gallery_photos FOR ALL TO authenticated
  USING (public.can_edit_content(auth.uid())) WITH CHECK (public.can_edit_content(auth.uid()));

DROP POLICY IF EXISTS "admins manage partners" ON public.partners;
CREATE POLICY "admins manage partners" ON public.partners FOR ALL TO authenticated
  USING (public.can_edit_content(auth.uid())) WITH CHECK (public.can_edit_content(auth.uid()));
DROP POLICY IF EXISTS "admins read all partners" ON public.partners;
CREATE POLICY "admins read all partners" ON public.partners FOR SELECT TO authenticated
  USING (public.can_edit_content(auth.uid()));

DROP POLICY IF EXISTS "Admins manage jobs" ON public.jobs;
CREATE POLICY "Admins manage jobs" ON public.jobs FOR ALL TO authenticated
  USING (public.can_edit_content(auth.uid())) WITH CHECK (public.can_edit_content(auth.uid()));
DROP POLICY IF EXISTS "Admins view job enquiries" ON public.job_applications;
CREATE POLICY "Admins view job enquiries" ON public.job_applications FOR SELECT TO authenticated
  USING (public.can_edit_content(auth.uid()));

DROP POLICY IF EXISTS "admins insert documents" ON public.documents;
CREATE POLICY "admins insert documents" ON public.documents FOR INSERT TO authenticated
  WITH CHECK (public.can_edit_content(auth.uid()));
DROP POLICY IF EXISTS "admins update documents" ON public.documents;
CREATE POLICY "admins update documents" ON public.documents FOR UPDATE TO authenticated
  USING (public.can_edit_content(auth.uid())) WITH CHECK (public.can_edit_content(auth.uid()));
DROP POLICY IF EXISTS "admins delete documents" ON public.documents;
CREATE POLICY "admins delete documents" ON public.documents FOR DELETE TO authenticated
  USING (public.can_edit_content(auth.uid()));

DROP POLICY IF EXISTS "Admins can insert village groups" ON public.village_groups;
CREATE POLICY "Admins can insert village groups" ON public.village_groups FOR INSERT TO authenticated
  WITH CHECK (public.can_edit_content(auth.uid()));
DROP POLICY IF EXISTS "Admins can update village groups" ON public.village_groups;
CREATE POLICY "Admins can update village groups" ON public.village_groups FOR UPDATE TO authenticated
  USING (public.can_edit_content(auth.uid())) WITH CHECK (public.can_edit_content(auth.uid()));
DROP POLICY IF EXISTS "Admins can delete village groups" ON public.village_groups;
CREATE POLICY "Admins can delete village groups" ON public.village_groups FOR DELETE TO authenticated
  USING (public.can_edit_content(auth.uid()));
DROP POLICY IF EXISTS "admins read all village groups" ON public.village_groups;
CREATE POLICY "admins read all village groups" ON public.village_groups FOR SELECT TO authenticated
  USING (public.can_edit_content(auth.uid()));

DROP POLICY IF EXISTS "Admins can update brand settings" ON public.brand_settings;
CREATE POLICY "Admins can update brand settings" ON public.brand_settings FOR UPDATE TO authenticated
  USING (public.can_edit_content(auth.uid())) WITH CHECK (public.can_edit_content(auth.uid()));
DROP POLICY IF EXISTS "Admins can insert brand settings" ON public.brand_settings;
CREATE POLICY "Admins can insert brand settings" ON public.brand_settings FOR INSERT TO authenticated
  WITH CHECK (public.can_edit_content(auth.uid()));

DROP POLICY IF EXISTS "admins update site settings" ON public.site_settings;
CREATE POLICY "admins update site settings" ON public.site_settings FOR UPDATE TO authenticated
  USING (public.can_edit_content(auth.uid())) WITH CHECK (public.can_edit_content(auth.uid()));
DROP POLICY IF EXISTS "admins insert site settings" ON public.site_settings;
CREATE POLICY "admins insert site settings" ON public.site_settings FOR INSERT TO authenticated
  WITH CHECK (public.can_edit_content(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage news subscribers" ON public.news_subscribers;
CREATE POLICY "Admins can manage news subscribers" ON public.news_subscribers FOR ALL TO authenticated
  USING (public.can_edit_content(auth.uid())) WITH CHECK (public.can_edit_content(auth.uid()));

DROP POLICY IF EXISTS "admin read contact" ON public.contact_messages;
CREATE POLICY "admin read contact" ON public.contact_messages FOR SELECT TO authenticated
  USING (public.can_edit_content(auth.uid()));

-- ---------- Restricted areas: levels 1 and 2 only ----------
DROP POLICY IF EXISTS "Admins manage community assets" ON public.community_assets;
CREATE POLICY "Admins manage community assets" ON public.community_assets FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "see own asset requests" ON public.asset_requests;
CREATE POLICY "see own asset requests" ON public.asset_requests FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "see own membership" ON public.memberships;
CREATE POLICY "see own membership" ON public.memberships FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "admin update membership" ON public.memberships;
CREATE POLICY "admin update membership" ON public.memberships FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "see own family members" ON public.membership_family_members;
CREATE POLICY "see own family members" ON public.membership_family_members FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.id = membership_family_members.membership_id
      AND (m.user_id = auth.uid() OR public.is_admin(auth.uid()))
  ));

DROP POLICY IF EXISTS "Admins manage surveys" ON public.surveys;
CREATE POLICY "Admins manage surveys" ON public.surveys FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "admin read responses" ON public.survey_responses;
CREATE POLICY "admin read responses" ON public.survey_responses FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "admin read volunteers" ON public.volunteer_applications;
CREATE POLICY "admin read volunteers" ON public.volunteer_applications FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "admin read referrals" ON public.referrals;
CREATE POLICY "admin read referrals" ON public.referrals FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "admin update referrals" ON public.referrals;
CREATE POLICY "admin update referrals" ON public.referrals FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- ---------- Account management: level 1 only ----------
DROP POLICY IF EXISTS "super admins read all roles" ON public.user_roles;
CREATE POLICY "super admins read all roles" ON public.user_roles FOR SELECT TO authenticated
  USING (public.is_super_admin(auth.uid()));
DROP POLICY IF EXISTS "super admins grant roles" ON public.user_roles;
CREATE POLICY "super admins grant roles" ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (public.is_super_admin(auth.uid()));
DROP POLICY IF EXISTS "super admins revoke roles" ON public.user_roles;
CREATE POLICY "super admins revoke roles" ON public.user_roles FOR DELETE TO authenticated
  USING (public.is_super_admin(auth.uid()) AND user_id <> auth.uid());

GRANT SELECT, INSERT, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;