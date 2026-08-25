-- ============================================================================
-- AI-KONTORET (/grok-bot) — datamodell för digital leverans
-- ----------------------------------------------------------------------------
-- Förberedd infrastruktur för när produkten går live. Körs endast om ägaren
-- applicerar migrationen; den påverkar ingen befintlig logik.
--
-- Flöde (när det aktiveras):
--   Stripe Payment Link → webhook checkout.session.completed
--   → edge-funktion `ai-kontoret-deliver` (ej byggd ännu) verifierar sessionen
--     mot Stripe och skriver en rad i ai_kontoret_purchases
--   → kunden får mejl med signerad, tidsbegränsad nedladdningslänk mot en
--     PRIVAT storage-bucket (ai-kontoret-assets) — aldrig publika url:er.
-- ============================================================================

-- Köpavvikelser: en rad per lyckat köp (guide / vault / bundle).
create table if not exists public.ai_kontoret_purchases (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email text not null,
  product text not null check (product in ('guide', 'vault', 'bundle')),
  amount_sek integer not null check (amount_sek > 0),
  stripe_session_id text unique,          -- idempotens: samma session = samma rad
  delivered_at timestamptz,               -- sätts när leveransmejlet gått ut
  delivery_count integer not null default 0 -- antal utfärdade nedladdningslänkar
);

comment on table public.ai_kontoret_purchases is
  'AI-KONTORET: köp av digital guide/vault/bundle via Stripe Payment Links.';

-- Produktfiler: metadata för vilka assets som levereras per produkt/version.
-- Själva filerna ligger i en privat bucket; här sparas bara sökväg + version.
create table if not exists public.ai_kontoret_assets (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  product text not null check (product in ('guide', 'vault')),
  version text not null,                  -- t.ex. "1.0"
  storage_path text not null,             -- sökväg i privat bucket, aldrig publik
  label text not null,                    -- t.ex. "AI-KONTORET – guiden (PDF)"
  active boolean not null default true,   -- peka om till ny version utan att röra historik
  unique (product, version, storage_path)
);

comment on table public.ai_kontoret_assets is
  'AI-KONTORET: versionerade produktfiler (storage_path i PRIVAT bucket).';

-- Ingen anon-åtkomst: köpdata läses/skrivs bara av service role (edge-funktion).
alter table public.ai_kontoret_purchases enable row level security;
alter table public.ai_kontoret_assets enable row level security;

-- Ägaren kan följa försäljningen i adminpanelen via service role.
-- (Inga publika policies skapas avsiktligt.)
