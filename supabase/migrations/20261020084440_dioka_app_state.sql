-- Apply once in Supabase SQL editor before enabling production.
-- Application records are accessed ONLY by the server's service role.
create table if not exists public.dioka_app_state (
  key text primary key,
  value jsonb not null,
  version bigint not null default 0
);
alter table public.dioka_app_state enable row level security;
revoke all on public.dioka_app_state from anon, authenticated;
grant all on public.dioka_app_state to service_role;

-- Remove the old permissive customer-data policies, including installations
-- that already ran the legacy schema. No browser role needs direct access.
do $$
declare item record;
begin
  for item in select schemaname, tablename, policyname from pg_policies
    where schemaname = 'public' and tablename in ('dioka_profiles','dioka_carts','dioka_orders')
  loop
    execute format('drop policy %I on %I.%I', item.policyname, item.schemaname, item.tablename);
  end loop;
  for item in select tablename from pg_tables where schemaname = 'public'
    and tablename in ('dioka_profiles','dioka_carts','dioka_orders')
  loop
    execute format('alter table public.%I enable row level security', item.tablename);
    execute format('revoke all on public.%I from anon, authenticated', item.tablename);
  end loop;
end $$;
