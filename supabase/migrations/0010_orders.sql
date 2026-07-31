-- 0010_orders.sql — orders placed from the shop.
--
-- There is no payment gateway: an order is a firm request to buy, which the
-- concierge confirms and invoices by hand (the house has always sold this way).
-- So an order carries two independent states — `status` for fulfilment and
-- `payment_status` for money — instead of pretending a checkout happened.
--
-- Orders are created SERVER-SIDE with the service role (after validation +
-- rate limiting) and priced from the products table, never from the browser.

-- Human-facing reference: CGM-01001, CGM-01002, …
create sequence if not exists public.order_number_seq start with 1001;
grant usage, select on sequence public.order_number_seq to service_role;

create table if not exists public.orders (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  order_number   text not null unique
                   default ('CGM-' || lpad(nextval('public.order_number_seq')::text, 5, '0')),

  customer_name  text not null,
  email          text not null,
  phone          text,

  address_line1  text,
  address_line2  text,
  city           text,
  postal_code    text,
  country        text,

  -- What the customer told us at checkout, and what the admin adds afterwards.
  note           text,
  admin_note     text,

  currency       text    not null default 'SGD',
  subtotal       numeric not null default 0,
  total          numeric not null default 0,

  status         text not null default 'pending'
                   check (status in ('pending', 'confirmed', 'shipped', 'completed', 'cancelled')),
  payment_status text not null default 'unpaid'
                   check (payment_status in ('unpaid', 'paid', 'refunded')),

  ip_hash        text,          -- salted hash of the client IP (never the raw IP)
  user_agent     text
);

create index if not exists orders_status_idx     on public.orders (status);
create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_email_idx      on public.orders (email);

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Line items. Title / price / image are SNAPSHOTS taken at order time, so the
-- order still reads correctly after the product is renamed, repriced or deleted
-- (product_id then goes null, the record does not).
-- ---------------------------------------------------------------------------
create table if not exists public.order_items (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  order_id   uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  title      text not null,
  slug       text,
  unit_price numeric,
  quantity   integer not null default 1 check (quantity > 0),
  line_total numeric,
  image_path text
);

create index if not exists order_items_order_idx on public.order_items (order_id);

alter table public.orders      enable row level security;
alter table public.order_items enable row level security;

-- Admin-only. The storefront never reads or writes orders through RLS — it goes
-- through /api/orders with the service role, which bypasses these policies.
drop policy if exists "admins manage orders" on public.orders;
create policy "admins manage orders"
  on public.orders for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "admins manage order items" on public.order_items;
create policy "admins manage order items"
  on public.order_items for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Deliberately NOT granted to anon: nobody browsing the shop may read orders,
-- with or without a policy. The dashboard reads them as `authenticated` (gated
-- by is_admin() above); /api/orders writes them as the service role.
grant select, insert, update, delete on public.orders, public.order_items to authenticated;
grant all on public.orders, public.order_items to service_role;
