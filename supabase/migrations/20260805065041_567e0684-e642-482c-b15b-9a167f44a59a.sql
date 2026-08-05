GRANT SELECT ON public.village_groups TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.village_groups TO authenticated;
GRANT ALL ON public.village_groups TO service_role;