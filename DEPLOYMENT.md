# Dioka production deployment

This build runs on Node.js 22.13+ (Node 24 recommended) using Next.js. It includes the storefront, customer chat, `/admin`, persistent products/content/accounts/orders/subscribers, and Stripe Checkout. It does not send transactional emails or run an AI pretending to be a staff member. Chat replies come from the admin inbox; the initial automatic receipt is labelled.

## 1. Configure persistent storage

Choose one:

- **Supabase:** apply `supabase/production.sql` in your own project. Set `SUPABASE_URL` and the **server-only** `SUPABASE_SERVICE_ROLE_KEY`. The legacy `NEXT_PUBLIC_SUPABASE_URL` is also accepted. Never put the service key in a `NEXT_PUBLIC_` variable. This supports multiple Node instances. The migration removes the legacy public customer-data policies.
- **One Node server:** set `DIOKA_DATA_DIR` to an absolute directory on a persistent volume. The application uses SQLite with WAL and transactions. Back up this directory with SQLite's online-backup tooling. Do not use this option on ephemeral serverless storage or separate disks across instances.

Without production storage configuration, data requests fail rather than silently falling back to memory. `GET /api/health` checks storage readiness.

The tracked legacy `data/atelier-store.json` demo is no longer used. If a previous deployment contains real customers in that file or the old Supabase tables, back it up and migrate those records separately before switching traffic. This release does not import demo passwords or claim that old customer accounts were migrated.

## 2. Provision the administrator

Copy `.env.example` to an untracked environment file for development, or set the values in your hosting dashboard. Use your own values.

1. Set `DIOKA_ADMIN_EMAILS` to the owner email (or comma-separated administrators).
2. Generate a random `DIOKA_BOOTSTRAP_SECRET` of at least 32 characters using your password manager. Keep it private.
3. Visit `/admin`, choose **First time? Set up the owner account**, and enter the configured owner email, setup secret and a password of 12+ characters.
4. Remove `DIOKA_BOOTSTRAP_SECRET` from the deployed environment after provisioning. Subsequent access uses the normal sign-in form.

Public registration cannot create an allowlisted administrator. Sessions use HttpOnly cookies, expire after seven days, and are stored by a hash of the session token. Passwords use salted scrypt. Admin endpoints enforce role checks and cross-origin write protection.

If your host places a trusted proxy in front of the app, configure that proxy to replace X-Forwarded-For, then set `DIOKA_TRUST_PROXY=true`. Otherwise leave it false; rate limits use a shared bucket rather than trusting a spoofable address. Add host-level request-size and traffic limits for a public launch.

## 3. Connect and test payments

Set `DIOKA_SITE_URL` to your canonical HTTPS origin, `STRIPE_SECRET_KEY` to your Stripe key, and `STRIPE_WEBHOOK_SECRET` to the signing secret for `/api/webhooks/stripe`. Subscribe to:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.expired`

Complete a Stripe test-mode purchase, confirm the order appears in `/admin`, verify the payment in Stripe and update tracking. Then supply live-mode credentials and set `DIOKA_STORE_LIVE=true`. Until those settings exist, checkout stays unavailable and customers keep their bag.

Prices are read from the server catalogue in USD. Stock is reserved atomically before opening a 30-minute Stripe checkout; paid reservations consume stock, expired checkouts release it. Both the signed webhook and server-verified receipt can complete fulfillment idempotently. A URL query alone cannot create a paid order. Admin stock values mean the available, unreserved quantity. Returns, refunds, tax registration/rates and shipping charges are business settings to establish with your payment account; this release charges the listed item total and has no automated refund interface.

## 4. Build and run

```sh
npm ci --legacy-peer-deps
npm run typecheck
npm run build
npm run test:integration
npm start
```

The integration suite starts its own production server with an isolated temporary database and deterministic Stripe transport. It checks permissions, owner setup, product/content publishing, private chat/replies, pricing, stock reservations, signed payment handling, real tracking, duplicate events and restart persistence. It does not charge a card or replace test-mode verification in your actual Stripe account.

For Docker:

```sh
docker build -t dioka .
docker run --env-file .env.production -p 3000:3000 -v dioka-data:/app/data dioka
```

Serve HTTPS through your host/reverse proxy. Persist the volume or use Supabase. Keep environment files out of source control and container build context.

## Hosting compatibility

The repository contains a legacy ChatGPT Sites identity in `.openai/hosting.json`. Its existing site uses the Cloudflare/Sites publishing workflow, while this GitHub build uses Next.js standalone. Do not upload `.next/standalone` as a Cloudflare Worker. Deploy this build to a Node-compatible host (for example a Node service or a Docker host); a Sites deployment requires a separately verified framework/storage adaptation. Preserve the existing site's audience and live version until that deployment is verified.

Official references: [Next.js deployment](https://nextjs.org/docs/app/getting-started/deploying), [Stripe webhook signatures](https://docs.stripe.com/webhooks/signatures), [Stripe Checkout fulfillment](https://docs.stripe.com/checkout/fulfillment).

## Truehost / diokacraft.com

Use [TRUEHOST.md](TRUEHOST.md) for the cPanel or VPS deployment. `server.cjs` is the Passenger-compatible production entry point. Set the canonical origin to `https://diokacraft.com` and the owner allowlist to `contactus@diokacraft.com`.

For a new Supabase backend, follow [SUPABASE-SETUP.md](SUPABASE-SETUP.md), including the media migration and seed. The admin now includes a Media library and product image upload control.
