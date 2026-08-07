CREATE TABLE public.content_translations (
  id uuid primary key default gen_random_uuid(),
  lang text not null,
  source_hash text not null,
  source_text text not null,
  translated_text text not null,
  created_at timestamptz not null default now(),
  unique (lang, source_hash)
);
GRANT SELECT ON public.content_translations TO anon;
GRANT SELECT ON public.content_translations TO authenticated;
GRANT ALL ON public.content_translations TO service_role;
ALTER TABLE public.content_translations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Translations are public" ON public.content_translations FOR SELECT USING (true);