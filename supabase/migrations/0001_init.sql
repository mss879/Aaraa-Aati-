-- 0001_init.sql — foundation: extensions, shared helpers, admin allowlist
-- Run order: this file first. Every later migration depends on is_admin() and set_updated_at().

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Shared updated_at trigger. Attach to any table with an updated_at column.
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Admin allowlist. The only accounts that may read/write the back-office data.
-- Seed it (see supabase/README.md) with the email of the admin user you create
-- in Supabase Auth. Sign-ups must be DISABLED in Auth settings so this is the
-- only account that can exist.
-- ---------------------------------------------------------------------------
create table if not exists public.admins (
  email      text primary key,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

-- is_admin() answers "is the current logged-in user an allow-listed admin?".
-- SECURITY DEFINER so it can read public.admins regardless of that table's RLS,
-- and is the single source of truth used by every other table's policies.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.admins
    where email = (auth.jwt() ->> 'email')
  );
$$;

grant execute on function public.is_admin() to authenticated;

-- Admins may view the allowlist from the dashboard; only the service role
-- (used server-side) may modify it.
drop policy if exists "admins can view allowlist" on public.admins;
create policy "admins can view allowlist"
  on public.admins for select
  to authenticated
  using (public.is_admin());
