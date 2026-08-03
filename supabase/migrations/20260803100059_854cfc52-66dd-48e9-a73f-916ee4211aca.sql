
-- 1. Ownership-validated insert policies
DROP POLICY IF EXISTS "anyone can request asset" ON public.asset_requests;
CREATE POLICY "submit asset request" ON public.asset_requests FOR INSERT TO anon, authenticated
WITH CHECK (user_id IS NULL OR user_id = auth.uid());

DROP POLICY IF EXISTS "anyone can donate" ON public.donations;
CREATE POLICY "submit donation" ON public.donations FOR INSERT TO anon, authenticated
WITH CHECK ((user_id IS NULL OR user_id = auth.uid()) AND amount > 0 AND amount <= 1000000);

DROP POLICY IF EXISTS "anyone can apply" ON public.memberships;
CREATE POLICY "submit membership application" ON public.memberships FOR INSERT TO anon, authenticated
WITH CHECK (
  (user_id IS NULL OR user_id = auth.uid())
  AND length(btrim(full_name)) BETWEEN 2 AND 120
  AND email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' AND length(email) <= 255
  AND birth_month BETWEEN 1 AND 12
  AND birth_year BETWEEN 1900 AND extract(year from now())::int
);

DROP POLICY IF EXISTS "anyone can respond" ON public.survey_responses;
CREATE POLICY "submit survey response" ON public.survey_responses FOR INSERT TO anon, authenticated
WITH CHECK (user_id IS NULL OR user_id = auth.uid());

DROP POLICY IF EXISTS "anyone can volunteer" ON public.volunteer_applications;
CREATE POLICY "submit volunteer application" ON public.volunteer_applications FOR INSERT TO anon, authenticated
WITH CHECK (
  (user_id IS NULL OR user_id = auth.uid())
  AND length(btrim(full_name)) BETWEEN 2 AND 120
  AND email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' AND length(email) <= 255
);

-- 2. Family members only for a membership the caller owns (anon sign-up goes through submit_membership)
DROP POLICY IF EXISTS "anyone can add family on apply" ON public.membership_family_members;
CREATE POLICY "add family to own membership" ON public.membership_family_members FOR INSERT TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM public.memberships m
  WHERE m.id = membership_family_members.membership_id AND m.user_id = auth.uid()
));

-- 3. Remove remaining always-true insert checks
DROP POLICY IF EXISTS "anyone can contact" ON public.contact_messages;
CREATE POLICY "submit contact message" ON public.contact_messages FOR INSERT TO anon, authenticated
WITH CHECK (
  length(btrim(full_name)) BETWEEN 2 AND 120
  AND email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' AND length(email) <= 255
  AND length(btrim(subject)) BETWEEN 2 AND 200
  AND length(btrim(message)) BETWEEN 2 AND 5000
);

DROP POLICY IF EXISTS "anyone can refer" ON public.referrals;
CREATE POLICY "submit referral" ON public.referrals FOR INSERT TO anon, authenticated
WITH CHECK (
  length(btrim(referrer_name)) BETWEEN 2 AND 120
  AND referrer_email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' AND length(referrer_email) <= 255
  AND length(btrim(person_name)) BETWEEN 2 AND 120
  AND length(btrim(support_type)) BETWEEN 2 AND 100
  AND coalesce(length(details), 0) <= 5000
);

-- 4. Hide partner owner personal name from the public; keep business contact visible
REVOKE SELECT ON public.partners FROM anon;
GRANT SELECT (id, business_name, category, short_description, description, logo_url, phone, email, website, address, is_published, created_at) ON public.partners TO anon;

-- 5. Lock down internal SECURITY DEFINER functions from direct API calls
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, public;
REVOKE ALL ON FUNCTION public.submit_membership(text, text, text, text, integer, integer, public.membership_type, numeric, jsonb) FROM public;
GRANT EXECUTE ON FUNCTION public.submit_membership(text, text, text, text, integer, integer, public.membership_type, numeric, jsonb) TO anon, authenticated;
