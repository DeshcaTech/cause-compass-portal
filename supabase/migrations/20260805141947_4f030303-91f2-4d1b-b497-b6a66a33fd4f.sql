-- Hard-bind role helpers to the caller (service role/superuser keep full use)
CREATE OR REPLACE FUNCTION public.admin_level(_user_id uuid)
RETURNS integer LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT min(CASE r.role::text
    WHEN 'admin' THEN 1 WHEN 'admin_l2' THEN 2 WHEN 'admin_l3' THEN 3 END)
  FROM public.user_roles r
  WHERE r.user_id = _user_id
    AND (auth.uid() IS NULL OR _user_id = auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
      AND (auth.uid() IS NULL OR _user_id = auth.uid())
  );
$$;

-- Internal trigger helper must not be callable over the API
REVOKE ALL ON FUNCTION public.record_audit_event() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.enforce_pinned_news_limit() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.enforce_single_default_gallery() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;