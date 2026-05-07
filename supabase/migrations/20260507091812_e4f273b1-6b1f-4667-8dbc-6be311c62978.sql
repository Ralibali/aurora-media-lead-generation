create table public.cta_clicks (
  id uuid primary key default gen_random_uuid(),
  button text not null,
  location text,
  lead_label text,
  page_path text,
  session_id text,
  referrer text,
  user_agent text,
  created_at timestamptz not null default now()
);

alter table public.cta_clicks enable row level security;

create policy "Anyone can insert cta clicks"
on public.cta_clicks
for insert
to anon, authenticated
with check (true);

create index cta_clicks_created_at_idx on public.cta_clicks (created_at desc);
create index cta_clicks_button_idx on public.cta_clicks (button);