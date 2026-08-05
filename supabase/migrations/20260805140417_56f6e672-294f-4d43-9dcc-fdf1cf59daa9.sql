CREATE TABLE public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  actor_email text,
  action text not null,
  table_name text not null,
  record_id text,
  summary text,
  changed_fields jsonb,
  created_at timestamptz not null default now()
);

GRANT SELECT ON public.audit_log TO authenticated;
GRANT ALL ON public.audit_log TO service_role;

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit log" ON public.audit_log
  FOR SELECT TO authenticated
  USING (public.can_edit_content(auth.uid()));

CREATE INDEX audit_log_created_at_idx ON public.audit_log (created_at DESC);
CREATE INDEX audit_log_table_idx ON public.audit_log (table_name);

CREATE OR REPLACE FUNCTION public.record_audit_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _action text;
  _row jsonb;
  _old jsonb;
  _changed jsonb := '{}'::jsonb;
  _key text;
  _label text;
  _uid uuid := auth.uid();
  _email text;
BEGIN
  IF TG_OP = 'DELETE' THEN
    _action := 'delete'; _row := to_jsonb(OLD);
  ELSIF TG_OP = 'INSERT' THEN
    _action := 'create'; _row := to_jsonb(NEW);
  ELSE
    _action := 'update'; _row := to_jsonb(NEW); _old := to_jsonb(OLD);
    FOR _key IN SELECT jsonb_object_keys(_row) LOOP
      IF _key NOT IN ('updated_at') AND _row->_key IS DISTINCT FROM _old->_key THEN
        _changed := _changed || jsonb_build_object(_key, jsonb_build_object('from', _old->_key, 'to', _row->_key));
      END IF;
    END LOOP;
    IF _changed = '{}'::jsonb THEN RETURN NEW; END IF;
  END IF;

  _label := coalesce(
    _row->>'title', _row->>'full_name', _row->>'name', _row->>'business_name',
    _row->>'president_name', _row->>'org_name', _row->>'role', _row->>'id'
  );

  SELECT email INTO _email FROM public.profiles WHERE id = _uid;

  INSERT INTO public.audit_log (actor_id, actor_email, action, table_name, record_id, summary, changed_fields)
  VALUES (_uid, _email, _action, TG_TABLE_NAME, _row->>'id', _label,
          CASE WHEN _action = 'update' THEN _changed ELSE NULL END);

  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END; $$;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'user_roles','announcements','events','board_members','president_message',
    'village_groups','partners','jobs','documents','campaigns','surveys',
    'community_assets','galleries','site_settings','brand_settings'
  ] LOOP
    EXECUTE format(
      'CREATE TRIGGER audit_%1$s AFTER INSERT OR UPDATE OR DELETE ON public.%1$I FOR EACH ROW EXECUTE FUNCTION public.record_audit_event()', t);
  END LOOP;
END $$;

REVOKE EXECUTE ON FUNCTION public.record_audit_event() FROM anon, authenticated;