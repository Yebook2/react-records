begin;

create table public.entries (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  category text not null check (category in ('study', 'life')),
  title text not null check (char_length(btrim(title)) between 1 and 80),
  body text not null check (char_length(btrim(body)) between 1 and 4000),
  created_at timestamptz not null default now()
);

create index entries_owner_created_idx on public.entries (owner_id, created_at desc, id desc);
alter table public.entries enable row level security;

revoke all on public.entries from public, anon, authenticated;
grant select, delete on public.entries to authenticated;
grant insert (category, title, body), update (category, title, body)
  on public.entries to authenticated;

create policy entries_read_own on public.entries
  for select to authenticated using ((select auth.uid()) = owner_id);
create policy entries_create_own on public.entries
  for insert to authenticated with check ((select auth.uid()) = owner_id);
create policy entries_update_own on public.entries
  for update to authenticated using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);
create policy entries_delete_own on public.entries
  for delete to authenticated using ((select auth.uid()) = owner_id);

commit;
