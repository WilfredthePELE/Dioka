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

For a Vercel-managed admin password, set `DIOKA_ADMIN_PASSWORD` (12–128 characters) for Production. When present, it is the only password accepted for allowlisted administrator accounts; changing it and redeploying changes the login password. Keep it server-side and restrict Vercel project access. Leave it unset to use the salted password saved for the account.

If the owner forgets the password, set a separate random `DIOKA_ADMIN_RECOVERY_SECRET` of at least 32 characters in the Production environment and redeploy. On `/admin`, choose **Forgot the owner password? Reset it**, enter the allowlisted owner email, the recovery secret and a new password of at least 12 characters. A successful reset invalidates existing sessions. Remove `DIOKA_ADMIN_RECOVERY_SECRET` from Vercel and redeploy immediately after recovery.

Public registration cannot create an allowlisted administrator. Sessions use HttpOnly cookies, expire after seven days, and are stored by a hash of the session token. Passwords use salted scrypt. Admin endpoints enforce role checks and cross-origin write protection.

If your host places a trusted proxy in front of the app, configure that proxy to replace X-Forwarded-For, then set `DIOKA_TRUST_PROXY=true`. Otherwise leave it false; rate limits use a shared bucket rather than trusting a spoofable address. Add host-level request-size and traffic limits for a public launch.

## 3. Connect and test payments

The checkout supports Paystack and Stripe. Dioka's current catalogue prices and order totals are in USD, so the Paystack integration sends USD amounts in cents. Your Paystack business must be approved for USD payments before checkout can succeed. For a Nigeria-based Paystack account, confirm USD is enabled and that the account is configured to receive USD payouts; Paystack says USD payouts require a qualifying USD domiciliary account. If your Paystack account only accepts NGN, do not turn on checkout until the catalogue and checkout have been deliberately converted to NGN.

### Paystack setup

1. Activate your Paystack business and confirm that USD payments are enabled. Enable international payments if you expect international customers.
2. In Paystack, switch to Test Mode and copy the **Secret Key** (`sk_test_...`). Never use a public key in the server environment, and never share this key in chat or commit it to Git.
3. In your hosting dashboard, set these server environment variables:
   - `DIOKA_PAYMENT_PROVIDER=paystack`
   - `PAYSTACK_SECRET_KEY` to the test secret key
   - `DIOKA_SITE_URL=https://www.diokacraft.com`
   - `DIOKA_STORE_LIVE=true` only on a staging/preview deployment while testing
   - `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` for persistent production checkout, inventory, and orders
4. Deploy the staging/preview build. In the Paystack Dashboard, add the webhook URL `https://www.diokacraft.com/api/webhooks/paystack` (or your staging domain) and subscribe to `charge.success`. The webhook signature uses the same Paystack secret key, so there is no separate webhook secret variable. Keep the test webhook and its test key together.
5. Complete a test purchase using Paystack's test credentials. Confirm the customer returns to `/order-confirmation`, the order appears in `/admin`, stock decreases once, and a delivered `charge.success` event is accepted. Also check a cancelled or failed attempt and confirm it does not create a paid order.
6. When the account and test flow are ready, configure the production webhook URL in Paystack Live Mode. Replace the test key with the Live Secret Key (`sk_live_...`), set `DIOKA_PAYMENT_PROVIDER=paystack`, `DIOKA_SITE_URL=https://www.diokacraft.com`, and `DIOKA_STORE_LIVE=true` in Production, then redeploy. Never leave a test key or test webhook on the live site.

The server verifies every Paystack transaction against its saved amount, currency and reference before recording the order. It also checks the signed `charge.success` webhook and safely handles repeated success events. The customer redirect alone cannot mark an order paid. The admin's **Check pending payments** action verifies unresolved references with Paystack and keeps stock reserved when Paystack reports an unknown or pending result.

Paystack's supported transaction currencies and channels depend on your merchant account. USD availability and USD payout arrangements must be confirmed in your Paystack Dashboard; the code does not convert the USD catalogue into NGN. This build collects the item's listed price and shipping address but does not calculate shipping charges or taxes, send order emails, or automate refunds. Process refunds in Paystack and update the order status in the admin.

### Stripe alternative

To use Stripe instead, set `DIOKA_PAYMENT_PROVIDER=stripe`, configure `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`, and subscribe the Stripe endpoint `https://www.diokacraft.com/api/webhooks/stripe` to `checkout.session.completed`, `checkout.session.async_payment_succeeded`, and `checkout.session.expired`. Test with Stripe test keys and a separate test-mode webhook secret before replacing them with live-mode credentials. Leave `DIOKA_STORE_LIVE=false` until a verified test has passed.
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

Use [TRUEHOST.md](TRUEHOST.md) for the cPanel or VPS deployment. `server.cjs` is the Passenger-compatible production entry point. Set the canonical origin to `https://www.diokacraft.com` and the owner allowlist to `contactus@diokacraft.com`.

For a new Supabase backend, follow [SUPABASE-SETUP.md](SUPABASE-SETUP.md), including the media migration and seed. The admin now includes a Media library and product image upload control.
