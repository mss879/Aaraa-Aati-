-- 0003_inquiries.sql — contact-form submissions.
-- These land here, NOT in the CRM. The admin reviews them and promotes the good
-- ones into leads (which back-fills leads.inquiry_id and inquiries.promoted_lead_id).

create table if not exists public.inquiries (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  name             text not null,
  email            text not null,
  phone            text,
  interest         text,            -- the "Regarding" select on the contact form
  message          text not null,
  source_piece     text,            -- ?piece= prefill from the collections gallery, if any
  status           text not null default 'new'
                     check (status in ('new', 'read', 'archived')),
  promoted_lead_id uuid references public.leads(id) on delete set null
);

create index if not exists inquiries_status_idx     on public.inquiries (status);
create index if not exists inquiries_created_at_idx on public.inquiries (created_at desc);

-- Now that inquiries exists, close the loop from leads.inquiry_id.
alter table public.leads
  drop constraint if exists leads_inquiry_id_fkey;
alter table public.leads
  add constraint leads_inquiry_id_fkey
  foreign key (inquiry_id) references public.inquiries(id) on delete set null;

alter table public.inquiries enable row level security;

-- Admins read/manage via the dashboard session. Public submissions are inserted
-- server-side with the service role after validation + rate limiting.
drop policy if exists "admins manage inquiries" on public.inquiries;
create policy "admins manage inquiries"
  on public.inquiries for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
