
-- Lock down text_library: remove all public policies. Admin panel goes through service_role edge function.
DROP POLICY IF EXISTS "Public read text_library" ON public.text_library;
DROP POLICY IF EXISTS "Public insert text_library" ON public.text_library;
DROP POLICY IF EXISTS "Public update text_library" ON public.text_library;
DROP POLICY IF EXISTS "Public delete text_library" ON public.text_library;
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.text_library FROM anon, authenticated;
GRANT ALL ON public.text_library TO service_role;

-- Remove object-listing on public bucket; direct public URL access still works for lead-magnets.
DROP POLICY IF EXISTS "Public can read lead-magnets" ON storage.objects;
