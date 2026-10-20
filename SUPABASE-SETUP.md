# Dioka Supabase backend

## Provisioning status

Created and verified on 20 October 2026:

- Project: **Dioka**, ID plwxwgqlpurfvqgzcuin.
- Organization: **diokacraft website**, ID uswkjwcmzmvtcduqlfwb.
- Region: London (eu-west-2).
- Dashboard: https://supabase.com/dashboard/project/plwxwgqlpurfvqgzcuin .
- API URL: https://plwxwgqlpurfvqgzcuin.supabase.co .
- Applied migrations: 20261020084440 dioka_app_state and 20261020084445 dioka_media_storage, and 20261020093827 dioka_scalability.
- Migrated independent user, inventory, order, conversation and subscriber records; preserved legacy snapshots for recovery. The 12 catalogue products remain at zero stock.
- Provisioned the owner account contactus@diokacraft.com. Its generated password is in the ignored local outputs/cloud-admin-access.txt file. This is separate from the SQLite preview account.
- Verified live SQL row-security/permissions and bucket privacy. Real anonymous REST requests returned 401 for both app tables.

The database is fully provisioned. At the owner's request, secret credentials are left blank for manual configuration. The app is not connected to this cloud database until its server-only secret key is configured privately. The local .env.local file contains the project URL and an empty SUPABASE_SERVICE_ROLE_KEY field. No service key was retrieved or committed.

Supabase security advisors reported informational notices about the intentionally absent browser-role policies on these server-only tables ([explanation](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy)). The unused media date index is expected before uploads exist ([explanation](https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index)). No warning/error-level findings were returned.

## Apply in order

1. supabase/production.sql — app data table and server-only permissions.
2. supabase/migrations/20261020084445_dioka_media_storage.sql — upload metadata and public/private buckets.
3. supabase/migrations/20261020093827_dioka_scalability.sql — partition records, transactional stock/CAS functions, indexes and bounded temporary-record cleanup.
4. supabase/seed.sql — initial catalogue and website content; existing records are kept. Stock starts at zero until the owner enters actual quantities. Regenerate this seed with node scripts/generate-supabase-seed.mjs after changing source catalogue defaults.

## Data model actually used by the app

- dioka_app_state: versioned JSONB application records. Each user, session, product, reservation, paid order, conversation, subscriber, checkout snapshot and OAuth transaction has an independent key. Shared legacy aggregates are recovery snapshots only. PostgreSQL functions atomically reserve and settle stock; bounded multi-record compare-and-set transactions protect related writes. Content is a separate validated record. Password accounts remain app-managed. In Supabase Google mode, verified Supabase Auth Google users link to these private application accounts; app sessions remain server-checked opaque cookies. See GOOGLE-SIGN-IN.md for activation and exact callback settings.
- dioka_media: typed file metadata, owner identifier, bucket/path, MIME type, byte size and upload time.
- dioka-products bucket: public JPG/PNG/WebP/AVIF product images, maximum 8 MB per image. Public URLs are intended to appear on the website.
- dioka-private bucket: private PDF documents for the owner's media library, maximum 8 MB. Admin-only signed links expire after five minutes. These are not customer-accessible order attachments.

Both app tables have row-level security and no anon/authenticated privileges. A server-only service role key performs authorized requests after the app checks the owner session. Browser authentication does not grant direct database or upload access. Do not add public write policies to fix an error.

## Connect Truehost

Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY privately in the Node application's environment. The service role key must never use a NEXT_PUBLIC_ prefix or be committed. Restart the app and confirm /api/health is healthy, then sign in at /admin. The Media tab manages uploaded files; the product editor has an Upload product image control. Existing image URLs and local assets continue to work.

Backend credentials need to be entered privately in the hosting environment. The plugin connection alone does not automatically configure the website's environment.

## Data migration and launch checks

The local preview database is outputs/preview-data/dioka.sqlite. It is not copied automatically. If transferring preview edits, stop preview writes, back up that database and import app records into an empty target with the provided import script. The importer excludes sessions, OAuth transactions and rate-limit records and refuses to overwrite different cloud records. Seed after importing so initial records fill only missing keys. Review catalogue prices, real stock and policies before enabling checkout.

Before launch verify anonymous users cannot read either app table or private objects, only administrators can upload, a valid image uploads and displays on a product, a PDF opens only through its expiring admin link, and products/chat/accounts/orders survive an app restart. Run Supabase security advisors after migrations. Check backups and storage limits for the selected plan.

The isolated PostgreSQL checks use a local storage-schema fixture; they do not substitute for exercising the deployed Supabase API and Storage service. No live upload is claimed before that test.

## Final live checks

A transaction inserted and version-updated a temporary record, asserted success, then rolled back; no test rows remain. The owner record exists with a salted password hash. The environment template is .env.example; .env.local is an ignored local copy with blank secrets for the owner to fill. All payment and Google credentials also remain blank.

The local preview launcher intentionally uses SQLite and disables cloud credentials. For a Supabase-backed local run after filling .env.local, stop the preview and run npm run dev with DIOKA_SITE_URL=http://localhost:3000 in the local environment. On Truehost set DIOKA_SITE_URL=https://diokacraft.com. Use the cloud owner credentials after switching databases; preview credentials are separate.

## Traffic and maintenance

See SCALABILITY.md for measured checks and the unverified 10,000-concurrent-buyer requirement. Run the server-only dioka_cleanup_temporary RPC on a schedule to remove expired temporary records. No reservation is released by age alone: provider-confirmed expiry or operator reconciliation is required. The Free organization has not been sized for this launch.
