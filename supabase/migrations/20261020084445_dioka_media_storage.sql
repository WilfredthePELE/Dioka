-- Dioka application storage. Run after production.sql. Safe to reapply.
begin;
create table if not exists public.dioka_media (
  id uuid primary key,
  bucket text not null check (bucket in ('dioka-products', 'dioka-private')),
  path text not null,
  original_name text not null,
  content_type text not null,
  size_bytes bigint not null check (size_bytes > 0 and size_bytes <= 8388608),
  uploaded_by uuid not null,
  created_at timestamptz not null default now(),
  unique (bucket, path)
);
create index if not exists dioka_media_created_at_idx on public.dioka_media (created_at desc);
alter table public.dioka_media enable row level security;
revoke all on public.dioka_media from public, anon, authenticated;
grant select, insert, update, delete on public.dioka_media to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
 ('dioka-products', 'dioka-products', true, 8388608, array['image/jpeg','image/png','image/webp','image/avif']),
 ('dioka-private', 'dioka-private', false, 8388608, array['application/pdf'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
-- No browser upload or private-read policies: the app's authenticated admin API
-- authorizes actions and uses a server-only service role key. Public image URLs
-- are intentionally readable; private documents use short-lived signed URLs.
commit;
