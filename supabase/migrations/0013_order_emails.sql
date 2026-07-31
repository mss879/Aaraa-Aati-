-- 0013_order_emails.sql — transactional order email (Resend), the delivery step,
-- and courier tracking.
--
-- Three things:
--   1. 'out_for_delivery' joins the fulfilment states, between shipped and
--      completed. Setting it is what triggers the "arriving today" email.
--   2. Courier + tracking number live on the order, and are asked for in the
--      dashboard the moment a piece is marked shipped or out for delivery. All
--      three are nullable — a hand-delivered piece in Singapore has no tracking,
--      and the email simply omits the line.
--   3. order_emails is the outbox log. Every send attempt is recorded — sent or
--      failed — so the dashboard can show what the customer has actually been
--      told, and a failure (bad address, Resend outage) is visible rather than
--      silent.

alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders
  add constraint orders_status_check
  check (status in (
    'pending',
    'confirmed',
    'shipped',
    'out_for_delivery',
    'completed',
    'cancelled'
  ));

alter table public.orders add column if not exists courier         text;
alter table public.orders add column if not exists tracking_number text;
alter table public.orders add column if not exists tracking_url    text;

create table if not exists public.order_emails (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  order_id    uuid not null references public.orders(id) on delete cascade,
  -- 'placed' is the confirmation sent the moment the order arrives; the rest
  -- mirror the fulfilment state that triggered them.
  kind        text not null
                check (kind in ('placed', 'confirmed', 'shipped', 'out_for_delivery',
                                'completed', 'cancelled')),
  to_email    text not null,
  subject     text not null,
  status      text not null default 'sent' check (status in ('sent', 'failed')),
  provider_id text,               -- Resend's message id, for tracing a delivery
  error       text                -- why it failed, when it did
);

create index if not exists order_emails_order_idx      on public.order_emails (order_id, created_at desc);
create index if not exists order_emails_created_at_idx on public.order_emails (created_at desc);

alter table public.order_emails enable row level security;

drop policy if exists "admins read order emails" on public.order_emails;
create policy "admins read order emails"
  on public.order_emails for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Never granted to anon. The server writes the log with the service role.
grant select, insert, update, delete on public.order_emails to authenticated;
grant all on public.order_emails to service_role;
