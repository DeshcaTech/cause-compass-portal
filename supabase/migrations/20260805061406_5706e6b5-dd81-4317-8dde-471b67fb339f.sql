ALTER TABLE public.referrals ADD COLUMN IF NOT EXISTS is_self boolean NOT NULL DEFAULT false;

UPDATE public.referrals SET is_self = true WHERE lower(btrim(referrer_name)) = lower(btrim(person_name));

CREATE POLICY "admin update referrals" ON public.referrals
FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

GRANT UPDATE ON public.referrals TO authenticated;
GRANT ALL ON public.referrals TO service_role;