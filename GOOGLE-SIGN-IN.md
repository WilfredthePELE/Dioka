# Google sign-in through Supabase

## What is implemented

The full customer sign-in page is /sign-in, account creation is /join, and the signed-in page is /account. Existing header/footer account actions now navigate to these pages. Google sign-in supports Supabase Auth with PKCE, short-lived HttpOnly verifier cookies, server-side getUser verification and a private Dioka session. Verified Google identities are linked to existing Dioka accounts; saved bags are preserved. Browser-editable user metadata never grants owner access. Password accounts continue to work.

## Current live status

On 20 October 2026 the live Supabase settings endpoint confirmed that Google is disabled. The Google client ID/secret and app server secret remain blank, as requested by the owner. The database/storage connection plugin does not grant Google Cloud access or expose Supabase Auth management credentials. No live Google activation is claimed. The native dashboard browser could not start in this environment.

## Finish privately in the dashboards

1. In [Google Auth Platform](https://console.cloud.google.com/auth/clients), create a Web application OAuth client. Configure the Dioka brand/consent screen and openid, email and profile scopes. Add https://diokacraft.com as an authorized JavaScript origin. Add localhost or 127.0.0.1 only if testing locally.
2. Set the Google authorized redirect URI to **https://plwxwgqlpurfvqgzcuin.supabase.co/auth/v1/callback**. This is the Supabase callback, not the website callback.
3. In [Dioka Supabase Google settings](https://supabase.com/dashboard/project/plwxwgqlpurfvqgzcuin/auth/providers?provider=Google), enable Google and enter the Google client ID and secret privately. Retain nonce verification.
4. In Supabase URL Configuration set Site URL to https://diokacraft.com and add **https://diokacraft.com/api/auth/supabase/callback** to the redirect allow list. For local preview, add exactly http://127.0.0.1:3080/api/auth/supabase/callback; for the normal development server add exactly http://localhost:3000/api/auth/supabase/callback. Avoid broad wildcard redirects.
5. In the app server environment set DIOKA_GOOGLE_AUTH_PROVIDER=supabase, DIOKA_SUPABASE_GOOGLE_ENABLED=true, SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY. Configure the private SUPABASE_SERVICE_ROLE_KEY for the shared application database as described in SUPABASE-SETUP.md. Restart the server. The publishable key is already placed in the ignored local .env.local; private secrets remain blank.
6. Test a real Google sign-in, cancellation, sign-out/re-entry and bag persistence. The owner email contactus@diokacraft.com should first sign in using its existing password and choose Connect Google from /account. This prevents someone from silently taking over an existing custom-domain account.

Google’s prerequisite and callback requirements are documented in [Supabase’s Google guide](https://supabase.com/docs/guides/auth/social-login/auth-google).

## Optional configuration helper

The helper scripts/configure-supabase-google.mjs defaults to a dry run that prints only target URLs. With --apply it reads SUPABASE_ACCESS_TOKEN, GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET privately from the environment, preserves existing redirect allow-list entries, and verifies the new settings. Do not commit these values or paste them into chat. The website itself never needs a Supabase management token. After using the helper, remove that management token from the local environment.

Run privately: node --env-file=.env.local scripts/configure-supabase-google.mjs --apply. Set DIOKA_GOOGLE_LOCAL_REDIRECTS=true only when explicitly allowing the listed local callbacks.

## Existing direct Google mode

Existing installations can retain DIOKA_GOOGLE_AUTH_PROVIDER=direct with server-only GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET. Its Google callback is the website /api/auth/google/callback, unlike Supabase mode. Do not mix these callback settings. Supabase mode is preferred for new setup.

## Security verification

Tests use isolated provider fixtures, not real Google accounts or live credentials. They verify PKCE/cookie binding, code replay rejection, cancellation, server-verified Google identities, email confirmation, account linking, metadata/owner protection and bag continuity. All app database/storage access still passes through server authorization; no public write grants or permissive RLS policies were added.
