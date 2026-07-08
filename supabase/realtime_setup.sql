-- Safe Realtime setup for this project with current custom JWT auth.
-- This enables browser-side realtime only for PUBLIC site tables.
-- Do NOT expose private user tables (CartItem, Order, ActivityLog, User) to anon.

begin;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'Product'
  ) then
    execute 'alter publication supabase_realtime add table public."Product"';
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'Review'
  ) then
    execute 'alter publication supabase_realtime add table public."Review"';
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'ContentSection'
  ) then
    execute 'alter publication supabase_realtime add table public."ContentSection"';
  end if;
end $$;

alter table public."Product" replica identity full;
alter table public."Review" replica identity full;
alter table public."ContentSection" replica identity full;

alter table public."Product" enable row level security;
alter table public."Review" enable row level security;
alter table public."ContentSection" enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public."Product" to anon, authenticated;
grant select on public."Review" to anon, authenticated;
grant select on public."ContentSection" to anon, authenticated;

drop policy if exists "Public can read products" on public."Product";
create policy "Public can read products"
on public."Product"
for select
to anon, authenticated
using (true);

drop policy if exists "Public can read visible reviews" on public."Review";
create policy "Public can read visible reviews"
on public."Review"
for select
to anon, authenticated
using ("isHidden" = false);

drop policy if exists "Public can read content sections" on public."ContentSection";
create policy "Public can read content sections"
on public."ContentSection"
for select
to anon, authenticated
using (true);

commit;

-- Private tables note:
-- CartItem / Order / ActivityLog / User are NOT included here on purpose.
-- With the current app architecture, the frontend uses a custom backend JWT,
-- not Supabase Auth. Browser-side Supabase Realtime cannot securely subscribe
-- to per-user rows without a Supabase-recognized auth token or a backend relay.
