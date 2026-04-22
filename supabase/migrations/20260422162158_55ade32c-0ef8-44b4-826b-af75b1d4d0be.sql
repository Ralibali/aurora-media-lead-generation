create table if not exists public.faq_cta_clicks (
  id uuid primary key default gen_random_uuid(),
  page_path text,
  paket text,
  cta_label text,
  cta_source text not null default 'faq_footer',
  query text,
  category text,
  opened_question text,
  session_id text,
  user_agent text,
  created_at timestamptz not null default now()
);

alter table public.faq_cta_clicks enable row level security;

create policy "Anyone can insert faq cta clicks"
on public.faq_cta_clicks
for insert
to anon, authenticated
with check (true);

create index if not exists faq_cta_clicks_created_at_idx on public.faq_cta_clicks (created_at desc);
create index if not exists faq_cta_clicks_page_path_idx on public.faq_cta_clicks (page_path);