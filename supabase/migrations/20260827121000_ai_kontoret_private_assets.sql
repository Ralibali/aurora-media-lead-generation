-- AI-KONTORET: private product-file bucket. No public or anon read.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'ai-kontoret-assets',
  'ai-kontoret-assets',
  false,
  41943040,
  array['application/pdf']::text[]
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "ai-kontoret-assets public read" on storage.objects;
drop policy if exists "ai-kontoret-assets anon read" on storage.objects;
drop policy if exists "ai-kontoret-assets authenticated read" on storage.objects;

-- Fail closed: no policies for anon/authenticated. Service role bypasses RLS.
