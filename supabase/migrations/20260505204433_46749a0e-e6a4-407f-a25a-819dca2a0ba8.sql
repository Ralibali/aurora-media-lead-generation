UPDATE storage.buckets SET public = true WHERE id = 'lead-magnets';

CREATE POLICY "Public can read lead-magnets"
ON storage.objects FOR SELECT
USING (bucket_id = 'lead-magnets');