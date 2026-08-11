-- =====================================================================
-- THE DAILY BYTE — Supabase schema (free tier)
-- Run ONCE in the Supabase dashboard: SQL Editor -> paste -> Run.
-- Tables: posts, seen_links, publish_logs (worker pipeline) + suggestions (reader box)
-- =====================================================================

-- 1. posts — every drafted/published dispatch ---------------------------------
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  section text,
  content_md text not null,
  source_url text,
  status text not null default 'draft',          -- draft | published | failed
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. seen_links — the dedup ledger (never ingest the same URL twice) ----------
create table if not exists public.seen_links (
  id bigint generated always as identity primary key,
  url text unique not null,                       -- unique index = the dedup gate
  title_hash text,                                -- normalized-title fingerprint (M1)
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

-- 3. publish_logs — audit trail for every cross-post --------------------------
create table if not exists public.publish_logs (
  id bigint generated always as identity primary key,
  post_id uuid references public.posts(id) on delete cascade,
  channel text not null,
  status text not null,
  detail text,
  created_at timestamptz not null default now()
);

-- 4. suggestions — reader suggestion box (front end writes, editor reads) -----
create table if not exists public.suggestions (
  id bigint generated always as identity primary key,
  text text not null,
  status text not null default 'new',             -- new | queued | done
  created_at timestamptz not null default now()
);

-- RLS: lock everything down; anonymous INSERT into suggestions only -----------
alter table public.posts enable row level security;
alter table public.seen_links enable row level security;
alter table public.publish_logs enable row level security;
alter table public.suggestions enable row level security;

-- The service-role key (worker / editor CLI) bypasses RLS automatically.
-- The anon key (public, shipped in the front end) may ONLY drop a suggestion:
create policy "anon can drop a suggestion" on public.suggestions
  for insert to anon with check (true);

create policy "anon can read own suggestion" on public.suggestions
  for select to anon using (false);  -- editor reads via service key / dashboard

-- Indexes for the queries the worker runs -------------------------------------
create index if not exists idx_seen_links_last_seen on public.seen_links (last_seen_at desc);
create index if not exists idx_posts_status on public.posts (status);
create index if not exists idx_suggestions_status on public.suggestions (status);
