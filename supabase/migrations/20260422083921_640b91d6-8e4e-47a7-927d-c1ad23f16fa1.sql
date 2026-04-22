-- Allow anon CRUD on text_library; the admin page is password-gated client-side
-- and not linked anywhere on the public site.
CREATE POLICY "Public read text_library"
  ON public.text_library FOR SELECT
  USING (true);

CREATE POLICY "Public insert text_library"
  ON public.text_library FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public update text_library"
  ON public.text_library FOR UPDATE
  USING (true);

CREATE POLICY "Public delete text_library"
  ON public.text_library FOR DELETE
  USING (true);