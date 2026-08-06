ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS membership_fee_individual numeric NOT NULL DEFAULT 30,
  ADD COLUMN IF NOT EXISTS membership_fee_student numeric NOT NULL DEFAULT 15,
  ADD COLUMN IF NOT EXISTS membership_fee_family numeric NOT NULL DEFAULT 60,
  ADD COLUMN IF NOT EXISTS membership_free boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.guard_membership_fees()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF (NEW.membership_fee_individual IS DISTINCT FROM OLD.membership_fee_individual
      OR NEW.membership_fee_student IS DISTINCT FROM OLD.membership_fee_student
      OR NEW.membership_fee_family IS DISTINCT FROM OLD.membership_fee_family
      OR NEW.membership_free IS DISTINCT FROM OLD.membership_free)
     AND COALESCE(public.admin_level(auth.uid()), 99) > 2 THEN
    RAISE EXCEPTION 'Only level one and level two admins can change membership fees';
  END IF;
  IF NEW.membership_fee_individual < 0 OR NEW.membership_fee_student < 0 OR NEW.membership_fee_family < 0 THEN
    RAISE EXCEPTION 'Membership fees cannot be negative';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_membership_fees_trg ON public.site_settings;
CREATE TRIGGER guard_membership_fees_trg
BEFORE UPDATE ON public.site_settings
FOR EACH ROW EXECUTE FUNCTION public.guard_membership_fees();

REVOKE EXECUTE ON FUNCTION public.guard_membership_fees() FROM anon, authenticated;