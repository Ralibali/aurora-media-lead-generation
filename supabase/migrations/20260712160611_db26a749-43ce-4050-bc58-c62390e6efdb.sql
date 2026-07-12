
-- Tighten INSERT policies flagged as "always true"

-- Lead tables: inserts happen exclusively via edge functions using the service role.
-- Drop permissive anon INSERT policies so anonymous clients cannot write directly.
DROP POLICY IF EXISTS "Anyone can submit ai_map_leads" ON public.ai_map_leads;
DROP POLICY IF EXISTS "Anyone can submit ai_map_processes" ON public.ai_map_processes;
DROP POLICY IF EXISTS "Anyone can insert cta clicks" ON public.cta_clicks;

-- Analytics tables that ARE written from the browser: replace WITH CHECK (true)
-- with lightweight validation so the policies are no longer "always true".
DROP POLICY IF EXISTS "Anyone can insert ai karta clicks" ON public.ai_karta_clicks;
CREATE POLICY "Public can insert ai karta clicks (validated)"
  ON public.ai_karta_clicks
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(button) BETWEEN 1 AND 120
    AND (page_path IS NULL OR char_length(page_path) <= 500)
    AND (session_id IS NULL OR char_length(session_id) <= 120)
    AND (referrer IS NULL OR char_length(referrer) <= 500)
    AND (user_agent IS NULL OR char_length(user_agent) <= 500)
  );

DROP POLICY IF EXISTS "Anyone can insert faq search events" ON public.faq_search_events;
CREATE POLICY "Public can insert faq search events (validated)"
  ON public.faq_search_events
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(query) BETWEEN 1 AND 300
    AND result_count >= 0 AND result_count <= 10000
    AND (page_path IS NULL OR char_length(page_path) <= 500)
    AND (session_id IS NULL OR char_length(session_id) <= 120)
    AND (opened_question IS NULL OR char_length(opened_question) <= 500)
    AND (user_agent IS NULL OR char_length(user_agent) <= 500)
  );

DROP POLICY IF EXISTS "Anyone can insert faq cta clicks" ON public.faq_cta_clicks;
CREATE POLICY "Public can insert faq cta clicks (validated)"
  ON public.faq_cta_clicks
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(cta_source) BETWEEN 1 AND 120
    AND (cta_label IS NULL OR char_length(cta_label) <= 200)
    AND (category IS NULL OR char_length(category) <= 120)
    AND (query IS NULL OR char_length(query) <= 300)
    AND (paket IS NULL OR char_length(paket) <= 120)
    AND (page_path IS NULL OR char_length(page_path) <= 500)
    AND (session_id IS NULL OR char_length(session_id) <= 120)
    AND (opened_question IS NULL OR char_length(opened_question) <= 500)
    AND (user_agent IS NULL OR char_length(user_agent) <= 500)
  );

-- Storage: lock down write access to the public lead-magnets bucket so anonymous
-- users cannot upload, overwrite, or delete files. Public read stays intact via
-- the bucket's public flag for direct PDF links.
DROP POLICY IF EXISTS "lead-magnets service role write" ON storage.objects;
DROP POLICY IF EXISTS "lead-magnets deny anon write" ON storage.objects;
DROP POLICY IF EXISTS "lead-magnets public read" ON storage.objects;

CREATE POLICY "lead-magnets public read"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'lead-magnets');

CREATE POLICY "lead-magnets service role write"
  ON storage.objects
  FOR ALL
  TO service_role
  USING (bucket_id = 'lead-magnets')
  WITH CHECK (bucket_id = 'lead-magnets');
