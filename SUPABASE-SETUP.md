# Dioka Supabase backend

## Provisioning status

The user requested a new project named Dioka. Project creation and cloud migrations still require a working connection to the owner's Supabase account, the selected organization **diokacraft website** and any required cost acceptance. The repository does not claim that a live project or buckets already exist.

## Apply in order

1. supabase/production.sql — app data table and server-only permissions.
2. supabase/migrations/202610190001_media.sql — upload metadata and public/private buckets.
3. supabase/seed.sql — initial catalogue and website content; existing records are kept. Stock starts at zero until the owner enters actual quantities. Regenerate this seed with node scripts/generate-supabase-seed.mjs after changing source catalogue defaults.

## Data model actually used by the app

- dioka_app_state: versioned JSONB application records. Accounts/password hashes/sessions and carts share the accounts aggregate; catalogue and reservations share catalogue-v1; orders, inbox, content and subscribers have their own records. Checkout snapshots, rate limits and Google sign-in transactions use separate keys. Optimistic version checks protect concurrent writes. These are app-managed accounts, not Supabase Auth users. Google login remains the app's verified OAuth flow.
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
