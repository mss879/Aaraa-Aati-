-- 0012_seed_categories.sql — the shop's opening categories.
--
-- These are exactly the three category teasers on the home page (Rings,
-- Earrings, Bracelets), reusing the same portraits so /shop and the home grid
-- read as one house. Idempotent: re-running never duplicates or overwrites
-- copy the maison has since edited.
--
-- To add another (e.g. Necklaces), copy a row into a NEW migration file rather
-- than editing this one.

insert into public.product_categories (slug, name, description, image_url, sort_index, active)
values
  (
    'rings',
    'Rings',
    'Cathedral settings, pavé halos and seamless bands — cut and set by hand in the Colombo workshop.',
    '/ring_model.png',
    10,
    true
  ),
  (
    'earrings',
    'Earrings',
    'Articulated drops and sculpted studs, each stone set by eye to catch the light mid-motion.',
    '/earring_model.png',
    20,
    true
  ),
  (
    'bracelets',
    'Bracelets',
    'Graduated links and single-grain cuffs, weighted to drape rather than hang.',
    '/bracelet_model.png',
    30,
    true
  )
on conflict (slug) do nothing;
