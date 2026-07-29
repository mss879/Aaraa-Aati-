-- 0007_storage.sql — private bucket for AI ring renders.
-- Uploads are done server-side with the service role (bypasses RLS). Admins read
-- via signed URLs from the dashboard. The public never has access.

insert into storage.buckets (id, name, public)
values ('ring-generations', 'ring-generations', false)
on conflict (id) do nothing;

-- Admins may read objects in this bucket (needed for creating signed URLs when
-- the dashboard renders generation thumbnails).
drop policy if exists "admins read ring-generations" on storage.objects;
create policy "admins read ring-generations"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'ring-generations' and public.is_admin());
