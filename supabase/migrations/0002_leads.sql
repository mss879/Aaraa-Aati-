-- 0002_leads.sql — CRM pipeline.
-- A lead is created the moment a visitor enters the atelier (source='atelier'),
-- or promoted from an inquiry (source='inquiry'), or added by hand (source='manual').
-- It is enriched over time with the customization config and AI generations.

create table if not exists public.leads (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  name            text not null,
  phone           text not null,
  email           text,
  source          text not null default 'atelier'
                    check (source in ('atelier', 'inquiry', 'manual')),
  stage           text not null default 'new'
                    check (stage in ('new', 'contacted', 'qualified', 'quoted', 'won', 'lost')),
  -- Ordering within a Kanban column. Larger = higher in the column. Drag sets
  -- this to the midpoint between neighbours so reordering never rewrites siblings.
  sort_index      double precision not null default extract(epoch from clock_timestamp()),
  config          jsonb,               -- RingConfig snapshot (see src/lib/ring-options.ts)
  estimated_price numeric,
  note            text,                -- freeform note the admin keeps on the lead
  inquiry_id      uuid,                -- set when promoted from an inquiry (fk added in 0003)
  archived        boolean not null default false
);

create index if not exists leads_stage_idx      on public.leads (stage);
create index if not exists leads_created_at_idx  on public.leads (created_at desc);
create index if not exists leads_source_idx      on public.leads (source);
create index if not exists leads_stage_sort_idx  on public.leads (stage, sort_index desc);

drop trigger if exists leads_set_updated_at on public.leads;
create trigger leads_set_updated_at
  before update on public.leads
  for each row execute function public.set_updated_at();

alter table public.leads enable row level security;

-- Only admins touch leads through the authenticated dashboard session.
-- Public lead creation happens server-side with the service role (bypasses RLS)
-- after validation + rate limiting, so no anon policy is needed.
drop policy if exists "admins manage leads" on public.leads;
create policy "admins manage leads"
  on public.leads for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
