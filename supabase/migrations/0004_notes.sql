-- 0004_notes.sql — admin sticky notes (dashboard scratchpad).

create table if not exists public.notes (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  body       text not null default '',
  color      text not null default 'sapphire'
               check (color in ('sapphire', 'amber', 'emerald', 'rose', 'slate')),
  pinned     boolean not null default false,
  author     text            -- email of the admin who wrote it
);

create index if not exists notes_pinned_idx     on public.notes (pinned desc, updated_at desc);
create index if not exists notes_updated_at_idx on public.notes (updated_at desc);

drop trigger if exists notes_set_updated_at on public.notes;
create trigger notes_set_updated_at
  before update on public.notes
  for each row execute function public.set_updated_at();

alter table public.notes enable row level security;

drop policy if exists "admins manage notes" on public.notes;
create policy "admins manage notes"
  on public.notes for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
