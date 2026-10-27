begin;
update storage.buckets
set allowed_mime_types = array['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/avif']
where id = 'dioka-private';
commit;
