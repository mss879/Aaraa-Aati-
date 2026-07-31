-- 0008_craft_requests.sql — the Crafting inbox.
--
-- Atelier (bespoke design) submissions used to be written straight into the CRM
-- as leads. They now land in their OWN queue — craft_requests — exactly like
-- contact-form messages land in `inquiries`. Both queues are triaged by hand and
-- the good ones are promoted into `leads` ("Send to CRM"), so the pipeline only
-- ever holds people the maison has actually decided to work.
--
--   /contact  → inquiries      → promote → leads (source='inquiry')
--   /atelier  → craft_requests → promote → leads (source='craft')

create table if not exists public.craft_requests (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  name             text not null,
  phone            text not null,
  email            text,
  -- RingConfig snapshot (see src/lib/ring-options.ts), enriched as they design.
  config           jsonb,
  estimated_price  numeric,
  status           text not null default 'new'
                     check (status in ('new', 'read', 'archived')),
  note             text,              -- freeform note the admin keeps on the request
  promoted_lead_id uuid references public.leads(id) on delete set null,
  ip_hash          text,              -- salted hash of the client IP (never the raw IP)
  user_agent       text
);

create index if not exists craft_requests_status_idx     on public.craft_requests (status);
create index if not exists craft_requests_created_at_idx on public.craft_requests (created_at desc);

drop trigger if exists craft_requests_set_updated_at on public.craft_requests;
create trigger craft_requests_set_updated_at
  before update on public.craft_requests
  for each row execute function public.set_updated_at();

alter table public.craft_requests enable row level security;

-- Admins manage them through the dashboard session. Public submissions are
-- inserted server-side with the service role after validation + rate limiting.
drop policy if exists "admins manage craft requests" on public.craft_requests;
create policy "admins manage craft requests"
  on public.craft_requests for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Never granted to anon: a commission is private. The dashboard reads it as
-- `authenticated` (gated by the policy above); the atelier writes it through
-- /api/craft-requests with the service role.
grant select, insert, update, delete on public.craft_requests to authenticated;
grant all on public.craft_requests to service_role;

-- ---------------------------------------------------------------------------
-- Close the loop from leads, and widen the source vocabulary. 'atelier' is kept
-- so leads created before this migration stay valid; new promotions use 'craft'.
-- ---------------------------------------------------------------------------
alter table public.leads
  add column if not exists craft_request_id uuid references public.craft_requests(id) on delete set null;

create index if not exists leads_craft_request_idx on public.leads (craft_request_id);

alter table public.leads drop constraint if exists leads_source_check;
alter table public.leads
  add constraint leads_source_check
  check (source in ('atelier', 'inquiry', 'manual', 'craft'));

-- ---------------------------------------------------------------------------
-- AI renders now belong to a craft request. lead_id stays (nullable) and is
-- back-filled when the request is promoted, so the CRM card keeps its renders.
-- ---------------------------------------------------------------------------
alter table public.generations
  add column if not exists craft_request_id uuid references public.craft_requests(id) on delete set null;

create index if not exists generations_craft_request_idx on public.generations (craft_request_id);
