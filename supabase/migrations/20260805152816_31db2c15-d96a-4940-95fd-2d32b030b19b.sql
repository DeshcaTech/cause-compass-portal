CREATE OR REPLACE FUNCTION public.guard_developer_whatsapp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.developer_whatsapp IS DISTINCT FROM OLD.developer_whatsapp
     AND NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only level one admins can change the developer WhatsApp number';
  END IF;
  IF (NEW.contact_whatsapp IS DISTINCT FROM OLD.contact_whatsapp
      OR NEW.show_contact_whatsapp IS DISTINCT FROM OLD.show_contact_whatsapp)
     AND COALESCE(public.admin_level(auth.uid()), 99) > 2 THEN
    RAISE EXCEPTION 'Only level one and level two admins can change the contact WhatsApp settings';
  END IF;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.guard_developer_whatsapp() FROM PUBLIC, anon, authenticated;