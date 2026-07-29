-- 0005_generations.sql — AI ring renders.
-- Every successful (or failed) generation is recorded and linked to the lead that
-- was captured at the start of the atelier. The PNG itself lives in the private
-- 'ring-generations' Storage bucket (see 0007); image_path points at it.

create table if not exists public.generations (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  lead_id         uuid references public.leads(id) on delete set null,
  config          jsonb not null,          -- RingConfig used for the render
  estimated_price numeric,
  prompt          text,                    -- built prompt, kept for audit
  image_path      text,                    -- path within the ring-generations bucket
  image_mime      text,
  status          text not null default 'done'
                    check (status in ('done', 'failed')),
  ip_hash         text,                    -- salted hash of the client IP (never the raw IP)
  user_agent      text
);

create index if not exists generations_lead_idx       on public.generations (lead_id);
create index if not exists generations_created_at_idx on public.generations (created_at desc);

alter table public.generations enable row level security;

drop policy if exists "admins read generations" on public.generations;
create policy "admins read generations"
  on public.generations for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
