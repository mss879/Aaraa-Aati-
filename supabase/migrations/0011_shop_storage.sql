-- 0011_shop_storage.sql — public bucket for product photography.
--
-- Unlike 'ring-generations' (private, signed URLs), product images ARE the
-- storefront: they must be servable straight from the CDN to anonymous
-- visitors, so this bucket is public-read. Writing is admin-only.
--
-- Uploads go directly from the dashboard's browser session to Storage (the
-- admin is authenticated, so the insert policy below is what authorises them).
-- That keeps large photographs off the serverless request path entirely — no
-- 1MB Server Action body limit, no 4.5MB route-handler body limit.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  10485760,                                          -- 10 MB per photograph
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Anyone may read (the bucket is public; this also covers the JS client's
-- list/download calls, which still go through RLS).
drop policy if exists "public reads product-images" on storage.objects;
create policy "public reads product-images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'product-images');

drop policy if exists "admins upload product-images" on storage.objects;
create policy "admins upload product-images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "admins update product-images" on storage.objects;
create policy "admins update product-images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'product-images' and public.is_admin())
  with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "admins delete product-images" on storage.objects;
create policy "admins delete product-images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-images' and public.is_admin());
