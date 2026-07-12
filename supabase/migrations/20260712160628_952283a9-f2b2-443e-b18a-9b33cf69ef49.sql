
DROP POLICY IF EXISTS "lead-magnets public read" ON storage.objects;

CREATE POLICY "lead-magnets public read single file"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'lead-magnets' AND name = 'aurora-ai-karta.pdf');
