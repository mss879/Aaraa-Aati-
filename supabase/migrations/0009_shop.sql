-- 0009_shop.sql — the e-commerce catalogue: categories, products, product images.
--
-- This is the only part of the schema the PUBLIC may read directly (anon role),
-- and only the rows that are meant to be seen: active categories, active
-- products, and the images of active products. Everything else stays behind
-- is_admin(). Writes are admin-only; the storefront never writes here.

-- ---------------------------------------------------------------------------
-- Categories. Seeded in 0012 with the three shown on the home page.
-- ---------------------------------------------------------------------------
create table if not exists public.product_categories (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  slug        text not null unique,
  name        text not null,
  description text,
  -- Cover art for the category card. Either a path in /public (e.g.
  -- '/ring_model.png') or a full URL to an uploaded image.
  image_url   text,
  sort_index  integer not null default 0,
  active      boolean not null default true
);

create index if not exists product_categories_sort_idx on public.product_categories (sort_index, name);

drop trigger if exists product_categories_set_updated_at on public.product_categories;
create trigger product_categories_set_updated_at
  before update on public.product_categories
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Products. `status` is the publish switch: only 'active' rows reach the shop.
-- `price` may be null — the piece then reads "Price upon request" and an order
-- for it is an enquiry the concierge quotes by hand.
-- ---------------------------------------------------------------------------
create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  slug        text not null unique,
  title       text not null,
  description text not null default '',
  price       numeric,
  currency    text not null default 'SGD',
  category_id uuid references public.product_categories(id) on delete set null,
  status      text not null default 'draft'
                check (status in ('draft', 'active', 'archived')),
  featured    boolean not null default false,
  in_stock    boolean not null default true,
  -- Larger = earlier in the grid. Defaults to "now" so new pieces lead.
  sort_index  double precision not null default extract(epoch from clock_timestamp())
);

create index if not exists products_status_idx   on public.products (status);
create index if not exists products_category_idx on public.products (category_id);
create index if not exists products_sort_idx     on public.products (sort_index desc);

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Product images — up to FIVE per product, held in the public 'product-images'
-- Storage bucket (0011). `path` is the object path inside that bucket;
-- `position` orders the gallery (0 = the card thumbnail).
-- ---------------------------------------------------------------------------
create table if not exists public.product_images (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  product_id uuid not null references public.products(id) on delete cascade,
  path       text not null,
  position   integer not null default 0,
  alt        text
);

create index if not exists product_images_product_idx on public.product_images (product_id, position);

-- The five-image cap is enforced here rather than in the app, so it holds no
-- matter who writes (dashboard, SQL editor, a future import script).
create or replace function public.enforce_product_image_limit()
returns trigger
language plpgsql
as $$
declare
  v_count integer;
begin
  select count(*) into v_count
  from public.product_images
  where product_id = new.product_id
    and (tg_op = 'INSERT' or id <> new.id);

  if v_count >= 5 then
    raise exception 'A product may have at most 5 images (product_id=%)', new.product_id
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

drop trigger if exists product_images_limit on public.product_images;
create trigger product_images_limit
  before insert or update of product_id on public.product_images
  for each row execute function public.enforce_product_image_limit();

-- ---------------------------------------------------------------------------
-- RLS. Two audiences: the storefront (anon, read-only, published rows only) and
-- the admin (everything).
-- ---------------------------------------------------------------------------
alter table public.product_categories enable row level security;
alter table public.products           enable row level security;
alter table public.product_images     enable row level security;

drop policy if exists "public reads active categories" on public.product_categories;
create policy "public reads active categories"
  on public.product_categories for select
  to anon, authenticated
  using (active);

drop policy if exists "admins manage categories" on public.product_categories;
create policy "admins manage categories"
  on public.product_categories for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "public reads active products" on public.products;
create policy "public reads active products"
  on public.products for select
  to anon, authenticated
  using (status = 'active');

drop policy if exists "admins manage products" on public.products;
create policy "admins manage products"
  on public.products for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "public reads active product images" on public.product_images;
create policy "public reads active product images"
  on public.product_images for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.products p
      where p.id = product_images.product_id
        and p.status = 'active'
    )
  );

drop policy if exists "admins manage product images" on public.product_images;
create policy "admins manage product images"
  on public.product_images for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Supabase grants these by default privilege; stating them explicitly means the
-- storefront still works if this schema is ever restored into a project where
-- that default was changed. RLS above is what actually limits what is returned.
grant select on public.product_categories, public.products, public.product_images
  to anon, authenticated;
grant insert, update, delete on public.product_categories, public.products, public.product_images
  to authenticated;
grant all on public.product_categories, public.products, public.product_images
  to service_role;
