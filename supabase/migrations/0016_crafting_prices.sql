-- 0016_crafting_prices.sql — editable pricing for the bespoke atelier.
--
-- Every number the atelier quote is built from used to live only in
-- src/lib/ring-options.ts, so changing the price of platinum or of a halo
-- setting meant a code edit and a deploy. This table lifts those numbers into
-- the back office.
--
-- Shape: one row per (group, option, field) rather than a column per price.
-- A wide table would need a migration every time a setting or a gem is added,
-- and the atelier gains options often. The trade-off is that nothing here is
-- type-checked by Postgres — src/lib/pricing.ts owns the list of legal keys and
-- is generated from the option arrays themselves, so the two cannot drift.
--
-- Missing row = use the compiled-in default. That is deliberate: the storefront
-- must still quote correctly when Supabase is unreachable, and a newly added
-- option prices itself from code until someone sets it here.

create table if not exists public.crafting_prices (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  -- 'piece' | 'setting' | 'metal' | 'gem' | 'bracelet_style' | 'pendant_style'
  group_id    text not null,
  -- The option's id as it appears in ring-options.ts ('solitaire', 'platinum').
  option_id   text not null,
  -- Which number on that option ('basePrice', 'pricePerCarat', 'metalFactor'…).
  field       text not null,
  -- Currency amounts are whole SGD; factors are multipliers like 1.45.
  -- Negative prices are never meaningful, so the floor is enforced here as well
  -- as in the server action.
  value       numeric not null check (value >= 0),
  unique (group_id, option_id, field)
);

create index if not exists crafting_prices_group_idx
  on public.crafting_prices (group_id, option_id);

drop trigger if exists crafting_prices_set_updated_at on public.crafting_prices;
create trigger crafting_prices_set_updated_at
  before update on public.crafting_prices
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Seed with the values currently compiled into src/lib/ring-options.ts, so the
-- back office opens on the real numbers instead of an empty grid. `on conflict
-- do nothing` keeps a re-run from stamping on prices the client has since
-- edited.
-- ---------------------------------------------------------------------------
insert into public.crafting_prices (group_id, option_id, field, value) values
  -- Pieces: flat crafting premium, and how metal/setting cost scales per piece.
  ('piece', 'ring',           'craftBase',      0),
  ('piece', 'ring',           'metalFactor',    1),
  ('piece', 'ring',           'settingFactor',  1),
  ('piece', 'necklace',       'craftBase',      450),
  ('piece', 'necklace',       'metalFactor',    2.1),
  ('piece', 'necklace',       'settingFactor',  0.9),
  ('piece', 'bracelet',       'craftBase',      650),
  ('piece', 'bracelet',       'metalFactor',    2.2),
  ('piece', 'bracelet',       'settingFactor',  0),

  -- Ring settings.
  ('setting', 'solitaire',    'basePrice', 1800),
  ('setting', 'tension',      'basePrice', 2400),
  ('setting', 'three-stone',  'basePrice', 3200),
  ('setting', 'pave',         'basePrice', 2400),
  ('setting', 'channel',      'basePrice', 2600),
  ('setting', 'bezel',        'basePrice', 2000),
  ('setting', 'halo',         'basePrice', 2600),
  ('setting', 'double-halo',  'basePrice', 3400),
  ('setting', 'split-shank',  'basePrice', 2500),
  ('setting', 'cathedral',    'basePrice', 2300),
  ('setting', 'vintage',      'basePrice', 3000),
  ('setting', 'milgrain',     'basePrice', 2200),
  ('setting', 'trilogy',      'basePrice', 3400),
  ('setting', 'toi-et-moi',   'basePrice', 3000),
  ('setting', 'bypass',       'basePrice', 2400),
  ('setting', 'flush',        'basePrice', 1900),
  ('setting', 'stackable',    'basePrice', 1600),
  ('setting', 'signet',       'basePrice', 2600),

  -- Metals, per piece of metalwork before the piece's metalFactor.
  ('metal', 'yellow-gold',    'price', 950),
  ('metal', 'rose-gold',      'price', 950),
  ('metal', 'white-gold',     'price', 1050),
  ('metal', 'platinum',       'price', 1600),

  -- Gemstones, per carat.
  ('gem', 'diamond',          'pricePerCarat', 6800),
  ('gem', 'ruby',             'pricePerCarat', 4200),
  ('gem', 'sapphire',         'pricePerCarat', 3600),
  ('gem', 'emerald',          'pricePerCarat', 3900),
  ('gem', 'amethyst',         'pricePerCarat', 900),
  ('gem', 'aquamarine',       'pricePerCarat', 1200),

  -- Bracelet designs: metalwork multiplier. stoneCount is NOT here — it is a
  -- design fact that drives the 3D model as well as the price, so it stays in
  -- code where the geometry can rely on it.
  ('bracelet_style', 'single',   'priceFactor', 1.0),
  ('bracelet_style', 'tennis',   'priceFactor', 1.45),
  ('bracelet_style', 'station',  'priceFactor', 1.05),
  ('bracelet_style', 'bar',      'priceFactor', 1.15),
  ('bracelet_style', 'mixed',    'priceFactor', 1.1),

  -- Pendant designs.
  ('pendant_style', 'bezel',           'basePrice', 1400),
  ('pendant_style', 'prong',           'basePrice', 1500),
  ('pendant_style', 'pear-drop',       'basePrice', 1700),
  ('pendant_style', 'bar',             'basePrice', 1600),
  ('pendant_style', 'solitaire-drop',  'basePrice', 1200)
on conflict (group_id, option_id, field) do nothing;

-- ---------------------------------------------------------------------------
-- RLS. The atelier quotes live in the visitor's browser, so these numbers are
-- public by nature — anon may read them and nothing else. Only admins write.
-- ---------------------------------------------------------------------------
alter table public.crafting_prices enable row level security;

drop policy if exists "public reads crafting prices" on public.crafting_prices;
create policy "public reads crafting prices"
  on public.crafting_prices for select
  to anon, authenticated
  using (true);

drop policy if exists "admins manage crafting prices" on public.crafting_prices;
create policy "admins manage crafting prices"
  on public.crafting_prices for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select on public.crafting_prices to anon, authenticated;
grant insert, update, delete on public.crafting_prices to authenticated;
grant all on public.crafting_prices to service_role;
