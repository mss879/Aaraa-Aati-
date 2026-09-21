-- 0017_cost_formula_pricing.sql — the atelier moves to the client's cost sheet.
--
-- 0016 made the atelier's prices editable, but the numbers were a system of
-- piece multipliers, setting multipliers, crafting premiums and a hidden melee
-- discount, and the client could not reason about any of it. This replaces them
-- with exactly what their "Cost Formula" spreadsheet uses:
--
--   per metal     costPerGram                     group 'metal'
--   per gemstone  costPerCarat                    group 'gem'
--   per design    metalGrams, labour, markupPct   group 'design', option 'ring:halo' etc.
--
--   selling price = (grams × costPerGram + carat × stones × costPerCarat)
--                   × (1 + markupPct / 100) + labour
--
-- The table's shape does not change — it was built one-row-per-figure precisely
-- so new figures would not need new columns. What changes is its contents, and
-- who may read it.
--
-- Safe to run before or after the code that reads it is deployed, and safe to
-- re-run: the delete only removes rows the new code already ignores, and the
-- seed never overwrites a figure that has been set.

-- ---------------------------------------------------------------------------
-- 1. Retire the multiplier model.
-- Every row that is not one of the three new families goes: craftBase,
-- metalFactor, settingFactor, setting basePrice, metal price, bracelet
-- priceFactor, pendant basePrice — and the old gem pricePerCarat, which was a
-- RETAIL rate. That last one matters: the new costPerCarat is what the house
-- pays, so carrying 3,600 across as a cost would treble every sapphire.
-- (The code ignores all of these already; deleting them is so that nobody
-- reading this table in Supabase mistakes a dead figure for a live one.)
-- ---------------------------------------------------------------------------
delete from public.crafting_prices
where not (
     (group_id = 'metal'  and field = 'costPerGram')
  or (group_id = 'gem'    and field = 'costPerCarat')
  or (group_id = 'design' and field in ('metalGrams', 'labour', 'markupPct'))
);

-- ---------------------------------------------------------------------------
-- 2. Starting values — generated from src/lib/pricing.ts, so the table opens on
-- the same figures the code falls back to. From the client's sheet: 18K yellow
-- gold $200/g, sapphire $1,200/ct, a 200% (×3) mark-up, and the solitaire at
-- 2 g with $150 labour. Everything else is a starting value to be replaced in
-- /admin/crafting-prices. `on conflict do nothing`: never overwrite a figure
-- the client has already set.
-- ---------------------------------------------------------------------------
insert into public.crafting_prices (group_id, option_id, field, value) values
  ('metal',   'yellow-gold',               'costPerGram',  200),
  ('metal',   'rose-gold',                 'costPerGram',  200),
  ('metal',   'white-gold',                'costPerGram',  220),
  ('metal',   'yellow-gold-14k',           'costPerGram',  155),
  ('metal',   'rose-gold-14k',             'costPerGram',  155),
  ('metal',   'white-gold-14k',            'costPerGram',  170),
  ('metal',   'platinum',                  'costPerGram',  340),
  ('gem',     'diamond',                   'costPerCarat', 2250),
  ('gem',     'ruby',                      'costPerCarat', 1400),
  ('gem',     'sapphire',                  'costPerCarat', 1200),
  ('gem',     'emerald',                   'costPerCarat', 1300),
  ('gem',     'amethyst',                  'costPerCarat', 300),
  ('gem',     'aquamarine',                'costPerCarat', 400),
  ('design',  'ring:solitaire',            'metalGrams',   2),
  ('design',  'ring:solitaire',            'labour',       150),
  ('design',  'ring:solitaire',            'markupPct',    200),
  ('design',  'ring:tension',              'metalGrams',   4),
  ('design',  'ring:tension',              'labour',       250),
  ('design',  'ring:tension',              'markupPct',    200),
  ('design',  'ring:pave',                 'metalGrams',   2.5),
  ('design',  'ring:pave',                 'labour',       300),
  ('design',  'ring:pave',                 'markupPct',    200),
  ('design',  'ring:channel',              'metalGrams',   3),
  ('design',  'ring:channel',              'labour',       300),
  ('design',  'ring:channel',              'markupPct',    200),
  ('design',  'ring:bezel',                'metalGrams',   2.5),
  ('design',  'ring:bezel',                'labour',       180),
  ('design',  'ring:bezel',                'markupPct',    200),
  ('design',  'ring:halo',                 'metalGrams',   2.8),
  ('design',  'ring:halo',                 'labour',       350),
  ('design',  'ring:halo',                 'markupPct',    200),
  ('design',  'ring:double-halo',          'metalGrams',   3.2),
  ('design',  'ring:double-halo',          'labour',       450),
  ('design',  'ring:double-halo',          'markupPct',    200),
  ('design',  'ring:split-shank',          'metalGrams',   3),
  ('design',  'ring:split-shank',          'labour',       220),
  ('design',  'ring:split-shank',          'markupPct',    200),
  ('design',  'ring:cathedral',            'metalGrams',   2.8),
  ('design',  'ring:cathedral',            'labour',       200),
  ('design',  'ring:cathedral',            'markupPct',    200),
  ('design',  'ring:vintage',              'metalGrams',   3.2),
  ('design',  'ring:vintage',              'labour',       400),
  ('design',  'ring:vintage',              'markupPct',    200),
  ('design',  'ring:milgrain',             'metalGrams',   2.4),
  ('design',  'ring:milgrain',             'labour',       220),
  ('design',  'ring:milgrain',             'markupPct',    200),
  ('design',  'ring:bypass',               'metalGrams',   3),
  ('design',  'ring:bypass',               'labour',       220),
  ('design',  'ring:bypass',               'markupPct',    200),
  ('design',  'ring:flush',                'metalGrams',   4.5),
  ('design',  'ring:flush',                'labour',       200),
  ('design',  'ring:flush',                'markupPct',    200),
  ('design',  'ring:signet',               'metalGrams',   6),
  ('design',  'ring:signet',               'labour',       250),
  ('design',  'ring:signet',               'markupPct',    200),
  ('design',  'necklace:bezel',            'metalGrams',   4.5),
  ('design',  'necklace:bezel',            'labour',       180),
  ('design',  'necklace:bezel',            'markupPct',    200),
  ('design',  'necklace:prong',            'metalGrams',   4.5),
  ('design',  'necklace:prong',            'labour',       180),
  ('design',  'necklace:prong',            'markupPct',    200),
  ('design',  'necklace:pear-drop',        'metalGrams',   5),
  ('design',  'necklace:pear-drop',        'labour',       220),
  ('design',  'necklace:pear-drop',        'markupPct',    200),
  ('design',  'necklace:bar',              'metalGrams',   5),
  ('design',  'necklace:bar',              'labour',       200),
  ('design',  'necklace:bar',              'markupPct',    200),
  ('design',  'necklace:solitaire-drop',   'metalGrams',   4),
  ('design',  'necklace:solitaire-drop',   'labour',       150),
  ('design',  'necklace:solitaire-drop',   'markupPct',    200),
  ('design',  'bracelet:single',           'metalGrams',   3),
  ('design',  'bracelet:single',           'labour',       180),
  ('design',  'bracelet:single',           'markupPct',    200),
  ('design',  'bracelet:tennis',           'metalGrams',   9),
  ('design',  'bracelet:tennis',           'labour',       600),
  ('design',  'bracelet:tennis',           'markupPct',    200),
  ('design',  'bracelet:station',          'metalGrams',   4),
  ('design',  'bracelet:station',          'labour',       250),
  ('design',  'bracelet:station',          'markupPct',    200),
  ('design',  'bracelet:bar',              'metalGrams',   6),
  ('design',  'bracelet:bar',              'labour',       350),
  ('design',  'bracelet:bar',              'markupPct',    200),
  ('design',  'bracelet:mixed',            'metalGrams',   5),
  ('design',  'bracelet:mixed',            'labour',       300),
  ('design',  'bracelet:mixed',            'markupPct',    200)
on conflict (group_id, option_id, field) do nothing;

-- ---------------------------------------------------------------------------
-- 3. Withdraw the public read.
-- 0016 let the anonymous role read this table because its figures were quoted
-- in the visitor's browser anyway. These are now COST prices and the house's
-- mark-ups — readable with the public anon key, they would show anyone that a
-- ring sells at three times its materials. The site now reads them server-side
-- with the service role and sends the browser finished retail prices only, so
-- anon needs nothing here. Admins keep full access through the existing
-- "admins manage crafting prices" policy.
-- ---------------------------------------------------------------------------
drop policy if exists "public reads crafting prices" on public.crafting_prices;
revoke select on public.crafting_prices from anon;

comment on table public.crafting_prices is
  'Atelier cost figures (client cost sheet): metal costPerGram, gem costPerCarat, and per-design metalGrams / labour / markupPct. COST data — not publicly readable; the site reads it server-side and publishes retail prices only.';
