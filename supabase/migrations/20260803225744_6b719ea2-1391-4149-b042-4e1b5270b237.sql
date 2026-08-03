DROP POLICY IF EXISTS "see own donations" ON public.donations;
CREATE POLICY "see own donations"
ON public.donations FOR SELECT TO authenticated
USING (auth.uid() = user_id OR public.can_manage(auth.uid(), 'fundraising'));