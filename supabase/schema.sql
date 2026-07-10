-- Triple Diamond Realty — Supabase schema
-- Run this once per tenant's Supabase project.
-- Dashboard > SQL Editor > paste and run.

-- =============================================================
-- 1. Buyer registrations (magic-link verified)
-- =============================================================
create table if not exists public.buyer_registrations (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  phone text not null,
  consent boolean not null default false,
  tenant text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists buyer_registrations_email_idx
  on public.buyer_registrations (email);
create index if not exists buyer_registrations_tenant_idx
  on public.buyer_registrations (tenant);

-- =============================================================
-- 2. Ebook signups (popup lead capture)
-- =============================================================
create table if not exists public.ebook_signups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  tenant text not null,
  created_at timestamptz not null default now()
);

create index if not exists ebook_signups_email_idx
  on public.ebook_signups (email);
create index if not exists ebook_signups_tenant_idx
  on public.ebook_signups (tenant);

-- =============================================================
-- 3. Agent contact requests (property page contact form)
-- =============================================================
create table if not exists public.agent_contact_requests (
  id uuid primary key default gen_random_uuid(),
  property_id text,
  property_address text,
  name text not null,
  email text not null,
  phone text not null,
  message text,
  is_military boolean not null default false,
  tenant text not null,
  created_at timestamptz not null default now()
);

create index if not exists agent_contact_requests_property_idx
  on public.agent_contact_requests (property_id);
create index if not exists agent_contact_requests_tenant_idx
  on public.agent_contact_requests (tenant);

-- =============================================================
-- Row Level Security
-- Anon key may INSERT into all three tables. Reads are admin-only
-- (use service role from Command portal).
-- =============================================================
alter table public.buyer_registrations enable row level security;
alter table public.ebook_signups enable row level security;
alter table public.agent_contact_requests enable row level security;

-- Buyer registrations: only the magic-link-verified user can upsert their own row
drop policy if exists "buyer_registrations_self_upsert" on public.buyer_registrations;
create policy "buyer_registrations_self_upsert" on public.buyer_registrations
  for insert to authenticated
  with check (auth.uid() = auth_user_id);

drop policy if exists "buyer_registrations_self_update" on public.buyer_registrations;
create policy "buyer_registrations_self_update" on public.buyer_registrations
  for update to authenticated
  using (auth.uid() = auth_user_id)
  with check (auth.uid() = auth_user_id);

-- supabase-js .upsert() sends `Prefer: return=representation` by default,
-- so PostgREST tries to SELECT the row back after the write. Without a
-- SELECT policy the write succeeds but the response fails, and the
-- frontend sees an error even though the row is in the table.
drop policy if exists "buyer_registrations_self_select" on public.buyer_registrations;
create policy "buyer_registrations_self_select" on public.buyer_registrations
  for select to authenticated
  using (auth.uid() = auth_user_id);

-- Ebook signups: anyone can submit
drop policy if exists "ebook_signups_public_insert" on public.ebook_signups;
create policy "ebook_signups_public_insert" on public.ebook_signups
  for insert to anon, authenticated
  with check (true);

-- Agent contact requests: anyone can submit
drop policy if exists "agent_contact_requests_public_insert" on public.agent_contact_requests;
create policy "agent_contact_requests_public_insert" on public.agent_contact_requests
  for insert to anon, authenticated
  with check (true);

-- =============================================================
-- 4. Buyer favorites (verified buyers only, cross-device)
-- =============================================================
-- Only stores the listing identifier — the actual property data lives in
-- mls.listings on the shared property-data DB and is looked up on demand.
create table if not exists public.buyer_favorites (
  id            uuid primary key default gen_random_uuid(),
  auth_user_id  uuid not null references auth.users(id) on delete cascade,
  tenant        text not null,
  listing_id    text not null,
  created_at    timestamptz not null default now(),
  unique (auth_user_id, tenant, listing_id)
);

create index if not exists buyer_favorites_user_tenant_idx
  on public.buyer_favorites (auth_user_id, tenant);

alter table public.buyer_favorites enable row level security;

-- SELECT own rows (needed for return=representation on insert AND for the
-- initial list-fetch after sign-in).
drop policy if exists "buyer_favorites_self_read" on public.buyer_favorites;
create policy "buyer_favorites_self_read" on public.buyer_favorites
  for select to authenticated
  using (auth.uid() = auth_user_id);

-- INSERT own rows.
drop policy if exists "buyer_favorites_self_insert" on public.buyer_favorites;
create policy "buyer_favorites_self_insert" on public.buyer_favorites
  for insert to authenticated
  with check (auth.uid() = auth_user_id);

-- DELETE own rows.
drop policy if exists "buyer_favorites_self_delete" on public.buyer_favorites;
create policy "buyer_favorites_self_delete" on public.buyer_favorites
  for delete to authenticated
  using (auth.uid() = auth_user_id);

notify pgrst, 'reload schema';
